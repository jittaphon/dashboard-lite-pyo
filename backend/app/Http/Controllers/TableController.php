<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Carbon\Carbon; // จำเป็นสำหรับการจัดการวันที่

class TableController extends BaseController
{

// --------------------------------------กลุ่มงาน คร ---------------------------------------------- //
public function getTableListOfDiseaseControl()
{
    try {
        $dbName = env('DB_DISEASE_CONTROL_DATABASE', 'db_disease_control');

        // 1. ดึงข้อมูลสรุปของตารางทั้งหมด
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

        // 2. ดึงรายละเอียด Column ทั้งหมดของ Database นี้ทีเดียวเลย (เพื่อประสิทธิภาพ)
        $allColumns = DB::select("
            SELECT 
                TABLE_NAME,
                COLUMN_NAME as title,
                COLUMN_NAME as dataIndex,
                COLUMN_NAME as `key`,
                DATA_TYPE as type,
                IS_NULLABLE as is_nullable,
                CHARACTER_MAXIMUM_LENGTH as length
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = :db_name
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        ", ['db_name' => $dbName]);

        // จัดกลุ่มคอลัมน์ตามชื่อตาราง
        $columnsByTable = collect($allColumns)->groupBy('TABLE_NAME');

        $formattedData = collect($tables)->map(function ($table) use ($columnsByTable) {
            // ดึงคอลัมน์ที่ตรงกับตารางนี้
            $tableColumns = $columnsByTable->get($table->table_id, collect([]))->map(function($col) {
                return [
                    'title' => $col->title,
                    'dataIndex' => $col->dataIndex,
                    'key' => $col->key,
                    'type' => strtoupper($col->type),
                    'is_nullable' => $col->is_nullable === 'YES'
                ];
            });

            return [
                'table_id' => $table->table_id,
                'table_label' => $table->table_label,
                'row_count' => (int)$table->row_count,
                'data_size' => round($table->data_size / 1024, 2) . ' KB',
                'engine' => $table->engine_type,
                'modified_date' => $table->modified_date 
                    ? \Carbon\Carbon::parse($table->modified_date)->addYears(543)->format('d/m/Y') 
                    : 'ยังไม่มีการเปลี่ยนแปลง',
                // เพิ่มส่วนนี้เข้าไป
                'columns' => $tableColumns 
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedData
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Schema Error: ' . $e->getMessage()
        ], 500);
    }
}
public function saveScreeningResults(Request $request)
{
    $rows = $request->input('data');

    if (empty($rows)) {
        return response()->json(['status' => 'error', 'message' => 'ไม่พบข้อมูลที่ส่งมา'], 400);
    }

    try {
        $dbName = env('DB_DISEASE_CONTROL_DATABASE', 'db_disease_control');
        $fullTableName = $dbName . '.tb_screening_results';

        // 1. ดึงปีงบประมาณจากข้อมูลที่ส่งมา เพื่อใช้ล้างข้อมูลเก่าเฉพาะปีนั้น
        $byears = collect($rows)->pluck('byear')->unique()->filter()->values()->toArray();

        DB::beginTransaction();

        // 2. ล้างข้อมูลเก่า (Replace logic)
        if (!empty($byears)) {
            DB::table($fullTableName)
                ->whereIn('byear', $byears)
                ->delete();
        }

        // 3. เตรียมข้อมูล (จัดการเฉพาะค่าว่างเพื่อให้ DB ไม่ Error)
        $insertData = array_map(function($item) {
            foreach ($item as $key => $value) {
                // ถ้าค่าเป็น string ว่าง ให้เปลี่ยนเป็น null เพื่อรองรับ Column ประเภทตัวเลข (Integer/Float)
                if ($value === "") {
                    $item[$key] = null;
                }
            }
            return $item;
        }, $rows);

        // 4. บันทึกข้อมูลแบบ Chunk (ทีละ 500 รายการ)
        foreach (array_chunk($insertData, 500) as $chunk) {
            DB::table($fullTableName)->insert($chunk);
        }

        DB::commit();

        return response()->json([
            'status' => 'success',
            'message' => 'บันทึกข้อมูลเรียบร้อยแล้ว จำนวน ' . count($insertData) . ' รายการ'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'status' => 'error', 
            'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()
        ], 500);
    }
}
public function saveRiskScore(Request $request)
{
    $rows = $request->input('data');

    if (empty($rows)) {
        return response()->json(['status' => 'error', 'message' => 'ไม่พบข้อมูลที่ส่งมา'], 400);
    }

    try {
        $dbName = env('DB_DISEASE_CONTROL_DATABASE', 'db_disease_control');
        $fullTableName = $dbName . '.tb_risk_score';

        // 1. ดึงปีงบประมาณจากข้อมูลที่ส่งมา เพื่อใช้ล้างข้อมูลเก่าเฉพาะปีนั้น
        $byears = collect($rows)->pluck('byear')->unique()->filter()->values()->toArray();

        DB::beginTransaction();

        // 2. ล้างข้อมูลเก่า (Replace logic)
        if (!empty($byears)) {
            DB::table($fullTableName)
                ->whereIn('byear', $byears)
                ->delete();
        }

        // 3. เตรียมข้อมูล (จัดการเฉพาะค่าว่างเพื่อให้ DB ไม่ Error)
        $insertData = array_map(function($item) {
            foreach ($item as $key => $value) {
                // ถ้าค่าเป็น string ว่าง ให้เปลี่ยนเป็น null เพื่อรองรับ Column ประเภทตัวเลข (Integer/Float)
                if ($value === "") {
                    $item[$key] = null;
                }
            }
            return $item;
        }, $rows);

        // 4. บันทึกข้อมูลแบบ Chunk (ทีละ 500 รายการ)
        foreach (array_chunk($insertData, 500) as $chunk) {
            DB::table($fullTableName)->insert($chunk);
        }

        DB::commit();

        return response()->json([
            'status' => 'success',
            'message' => 'บันทึกข้อมูลเรียบร้อยแล้ว จำนวน ' . count($insertData) . ' รายการ'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'status' => 'error', 
            'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()
        ], 500);
    }
}


    /**
     * ฟังก์ชัน GET ข้อมูล - ระบุ Database จาก env
     */
    public function getScreeningResults(Request $request)
{
    try {
        $dbName = env('DB_DISEASE_CONTROL_DATABASE', 'db_disease_control');
        
        $query = DB::table($dbName . '.tb_screening_results');

        if ($request->has('byear')) {
            $query->where('byear', $request->byear);
        }

        if ($request->has('ampur')) {
            $query->where('ampur', $request->ampur);
        }

        $results = $query->orderBy('byear', 'desc')
                        ->orderBy('ampur', 'asc')
                        ->get();

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
                                    ? \Carbon\Carbon::parse($item->update_at)->addYears(543)->format('d/m/Y H:i') 
                                    : '-'
            ];
        });

        // กำหนดประเภทของ Chart ที่ข้อมูลชุดนี้รองรับ
        // ช่วยให้ Frontend ตัดสินใจได้ว่าจะแสดงผลอะไรบ้าง
        $visualizations = [
            'supported_charts' => ['bar', 'donut', 'table'],
            'chart_config' => [
                'label_field' => 'risk_group',
                'value_fields' => ['target', 'cxr_total', 'ptb_plus', 'ptb_minus'],
                'group_by' => 'ampur'
            ]
        ];

        return response()->json([
            'status' => 'success',
            'visualizations' => $visualizations,
            'data' => $formattedData
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'ไม่สามารถดึงข้อมูลได้: ' . $e->getMessage()
        ], 500);
    }
}

// ------------------------------------------------------------------------------------ //
}
