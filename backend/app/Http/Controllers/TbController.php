<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Carbon\Carbon; // จำเป็นสำหรับการจัดการวันที่

class TbController extends BaseController
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
}
