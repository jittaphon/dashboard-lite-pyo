<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KpiController extends Controller
{
    /**
     * ดึงข้อมูล KPI ทั้งหมด จัดกลุ่มตามกลุ่มงาน (ส่งให้ React)
     */
 public function getDashboard(Request $request)
{
    $year = $request->input('year', 2569);

    // ดึงกลุ่มงานทั้งหมดเป็นตัวตั้ง (เพื่อให้แสดงกลุ่มงานครบ 1-9 เสมอ)
    $results = DB::table('departments as d')
        ->select(
            'd.id as dept_id',
            'd.dept_name as title',
            'd.dept_key as key',
            'k.kpi_title',
            'k.kpi_key',
            'r.actual_value',
            'r.target_value',
            'r.report_url as url'
        )
        // เชื่อมไปหา KPIs และ Results โดยกรองเฉพาะ "ปีที่เลือก"
        ->leftJoin('kpis as k', 'd.id', '=', 'k.dept_id')
        ->leftJoin('kpi_results as r', function($join) use ($year) {
            $join->on('k.id', '=', 'r.kpi_id')
                 ->where('r.fiscal_year', '=', $year); // กรองปีตรงนี้สำคัญมาก
        })
        ->orderBy('d.id', 'asc')
        ->get();

    $departments = [];
    foreach ($results as $row) {
        if (!isset($departments[$row->dept_id])) {
            $departments[$row->dept_id] = [
                "id" => (int)$row->dept_id,
                "title" => $row->title,
                "key" => $row->key,
                "topic" => []
            ];
        }

        // เงื่อนไข: จะยัดลง topic ก็ต่อเมื่อปีนั้นมีข้อมูลจริง (actual_value หรือ target_value ไม่เป็น null)
        if ($row->kpi_title && $row->actual_value !== null) {
            $departments[$row->dept_id]['topic'][] = [
                "title" => $row->kpi_title,
                "key" => $row->kpi_key,
                "url" => $row->url ?? "",
                "actual_value" => (float)$row->actual_value,
                "target_value" => (float)$row->target_value
            ];
        }
    }

    return response()->json(array_values($departments), 200, [], JSON_UNESCAPED_UNICODE);
}

    /**
     * ดึงค่าจาก DB อื่นมาหยอดใส่ DB หลัก (Sync Logic)
     */
public function syncData(Request $request, $year)
{
    // 1. ลองดึงข้อมูลจาก db_ncd_one ตาราง kpi_s_repleate2
    // ใช้คำสั่ง SELECT * FROM db_ncd_one.kpi_s_repleate2 LIMIT 5
    try {
        $externalData = DB::table('db_ncd_one.kpi_s_repleate2')
            ->limit(5) 
            ->get();

        // 2. ส่งค่ากลับไปดูที่ Browser ทันที
        return response()->json([
            'status' => 'success',
            'message' => 'เชื่อมต่อเส้นทางสำเร็จ!',
            'info' => [
                'request_year' => $year,
                'target_db' => 'db_ncd_one',
                'target_table' => 'kpi_s_repleate2'
            ],
            'data_preview' => $externalData // ข้อมูล 5 แถวแรกจะโชว์ตรงนี้
        ], 200, [], JSON_UNESCAPED_UNICODE);

    } catch (\Exception $e) {
        // ถ้าเชื่อมไม่ได้ หรือชื่อตารางผิด จะวิ่งมาที่นี่
        return response()->json([
            'status' => 'error',
            'message' => 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' . $e->getMessage()
        ], 500);
    }
}
}