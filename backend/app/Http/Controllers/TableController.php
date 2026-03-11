<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Carbon\Carbon; // จำเป็นสำหรับการจัดการวันที่

class TableController extends BaseController
{
public function getTableListOfDiseaseControl()
{
    try {
        $dbName = env('DB_DISEASE_CONTROL_DATABASE', 'db_disease_control');

        // ดึงข้อมูล Metadata ของตารางจาก INFORMATION_SCHEMA
        $tables = DB::select("
            SELECT 
                TABLE_NAME as table_id, 
                TABLE_NAME as table_label,
                TABLE_ROWS as row_count,
                UPDATE_TIME as modified_date,
                DATA_LENGTH as data_size,
                ENGINE as engine_type
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = :db_name
            ORDER BY UPDATE_TIME DESC, TABLE_NAME ASC
        ", ['db_name' => $dbName]);

        $formattedData = collect($tables)->map(function ($table) {
            return [
                'table_id' => $table->table_id,
                'table_label' => $table->table_label,
                'row_count' => (int)$table->row_count,
                // แปลงหน่วย Byte เป็น KB
                'data_size' => round($table->data_size / 1024, 2) . ' KB',
                'engine' => $table->engine_type,
                // ถ้า modified_date เป็น NULL (กรณีตารางยังไม่มีการเขียนข้อมูล) ให้ใช้ 'N/A'
                'modified_date' => $table->modified_date 
                    ? Carbon::parse($table->modified_date)->addYears(543)->format('d/m/Y H:i') 
                    : 'ยังไม่มีการเปลี่ยนแปลง'
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedData
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
}
public function saveScreeningResults(Request $request)
    {
        try {
            // รับข้อมูลจาก React (ควรส่งมาในรูปแบบ Array ของ Object)
            $data = $request->all();

            if (empty($data)) {
                return response()->json(['status' => 'error', 'message' => 'ไม่มีข้อมูลส่งมา'], 400);
            }

            // ใช้ upsert เพื่อจัดการ "ถ้าซ้ำให้ทับ ถ้าใหม่ให้เพิ่ม"
            // พารามิเตอร์ 1: ข้อมูลที่ต้องการบันทึก
            // พารามิเตอร์ 2: คอลัมน์ที่ใช้เช็คความซ้ำ (Unique Key)
            // พารามิเตอร์ 3: คอลัมน์ที่ต้องการให้อัปเดตค่าเมื่อเกิดการซ้ำ
            DB::table('tb_screening_results')->upsert(
                $data,
                ['byear', 'risk_group', 'ampur'], 
                ['risk_type', 'target', 'cxr_total', 'cxr_abnormal', 'ptb_plus', 'ptb_minus', 'ep_tb']
            );

            return response()->json([
                'status' => 'success',
                'message' => 'บันทึกและอัปเดตข้อมูลเรียบร้อยแล้ว'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ฟังก์ชัน GET ข้อมูล
     * ดึงข้อมูลทั้งหมดมาแสดงผล พร้อมแปลงวันที่เป็น พ.ศ.
     */
    public function getScreeningResults(Request $request)
    {
        try {
            $query = DB::table('tb_screening_results');

            // ถ้ามีการกรองปีงบประมาณจาก Frontend
            if ($request->has('byear')) {
                $query->where('byear', $request->byear);
            }

            // ถ้ามีการกรองตามอำเภอ
            if ($request->has('ampur')) {
                $query->where('ampur', $request->ampur);
            }

            $results = $query->orderBy('byear', 'desc')
                            ->orderBy('ampur', 'asc')
                            ->get();

            // จัดรูปแบบข้อมูลก่อนส่งกลับไปที่ React
            $formattedData = $results->map(function ($item) {
                return [
                    'id'            => $item->id,
                    'risk_group'    => $item->risk_group,
                    'risk_type'     => $item->risk_type,
                    'ampur'         => $item->ampur,
                    'target'        => (int)$item->target,
                    'cxr_total'     => (int)$item->cxr_total,
                    'cxr_abnormal'  => (int)$item->cxr_abnormal,
                    'ptb_plus'      => (int)$item->ptb_plus,
                    'ptb_minus'     => (int)$item->ptb_minus,
                    'ep_tb'         => (int)$item->ep_tb,
                    'byear'         => $item->byear,
                    'update_at_th'  => $item->update_at 
                                        ? Carbon::parse($item->update_at)->addYears(543)->format('d/m/Y H:i') 
                                        : '-'
                ];
            });

            return response()->json([
                'status' => 'success',
                'data'   => $formattedData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'ไม่สามารถดึงข้อมูลได้: ' . $e->getMessage()
            ], 500);
        }
    }
}
