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

        $tables = DB::select("
            SELECT TABLE_NAME as table_id, TABLE_NAME as table_label, 
                   TABLE_ROWS as row_count, UPDATE_TIME as modified_date
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = :db_name
        ", ['db_name' => $dbName]);

       $allColumns = DB::select("
    SELECT TABLE_NAME, COLUMN_NAME as `key`, COLUMN_NAME as title,
           COLUMN_COMMENT as thai_label, 
           DATA_TYPE as type
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = :db_name
    ORDER BY TABLE_NAME, ORDINAL_POSITION
", ['db_name' => $dbName]);

        $columnsByTable = collect($allColumns)->groupBy('TABLE_NAME');

        $formattedData = collect($tables)->map(function ($table) use ($columnsByTable) {
            $tableColumns = $columnsByTable->get($table->table_id, collect([]))->map(function($col) {
                return [
                    'title' => $col->title,        // ยังเป็น English (HN, age) เหมือนเดิม
                    'dataIndex' => $col->key,     // ยังเป็น English เหมือนเดิม
                    'key' => $col->key,           // ยังเป็น English เหมือนเดิม
                    'type' => strtoupper($col->type),
                    'thai_label' => $col->thai_label // ส่งไปให้ React ใช้จับคู่กับ Excel
                ];
            });

            return [
                'table_id' => $table->table_id,
                'table_label' => $table->table_label, 
                'row_count' => (int)$table->row_count,
                'columns' => $tableColumns 
            ];
        });

        return response()->json(['status' => 'success', 'data' => $formattedData]);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
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
    $rows = $request->input('data'); // ข้อมูลรายบุคคลจาก Excel
    $summaryRows = $request->input('summary_data'); // ข้อมูลสรุปจาก Form 9 อำเภอ
    $byear = $request->input('byear'); // ปีเอกสาร (ถ้ามีส่งแยกมา)

    if (empty($rows)) {
        return response()->json(['status' => 'error', 'message' => 'ไม่พบข้อมูลรายบุคคล'], 400);
    }

    try {
        $dbName = env('DB_DISEASE_CONTROL_DATABASE', 'db_disease_control');
        
        $tableIndividual = $dbName . '.tb_patient_risk_records';
        $tableSummary = $dbName . '.tb_hospital_screening_summary'; 

        // ดึงปีเอกสารจากข้อมูล Excel (สมมติว่า frontend แมป key เป็น 'doc_year' หรือใช้ $byear)
        $docYears = collect($rows)->pluck('doc_year')->filter()->unique()->values()->toArray();
        if (empty($docYears) && $byear) {
            $docYears = [$byear];
        }

        DB::beginTransaction();

        // --- ส่วนที่ 1: จัดการตารางรายบุคคล (Individual Records) ---
        // ลบข้อมูลเก่าของปีนั้นๆ ออกก่อน (ป้องการการนำเข้าซ้ำแล้วข้อมูลเบิ้ล)
        if (!empty($docYears)) {
            DB::table($tableIndividual)->whereIn('doc_year', $docYears)->delete();
        }

        $now = Carbon::now();
        $individualInsert = [];

        foreach ($rows as $row) {
            // แมปข้อมูลและเปลี่ยนค่าว่างเป็น null, แปลง 1=เลือก ให้เป็น boolean (1 หรือ 0)
            $individualInsert[] = [
                'seq_no' => $row['seq_no'] ?? null,
                'doc_year' => $row['doc_year'] ?? $byear,
                'province' => $row['province'] ?? null,
                'hospital' => $row['hospital'] ?? null,
                'hn' => $row['hn'] ?? null,
                'tb_no' => $row['tb_no'] ?? null,
                'age' => isset($row['age']) && $row['age'] !== "" ? (int)$row['age'] : null,
                'risk_level' => $row['risk_level'] ?? null,
                'total_score' => isset($row['total_score']) && $row['total_score'] !== "" ? (float)$row['total_score'] : null,
                
                // กลุ่มเสี่ยง (1=เลือก นอกนั้น 0)
                'is_age_over_65' => ($row['is_age_over_65'] ?? 0) == 1 ? 1 : 0,
                'is_ckd_4_5' => ($row['is_ckd_4_5'] ?? 0) == 1 ? 1 : 0,
                'is_hiv_cd4_less_200' => ($row['is_hiv_cd4_less_200'] ?? 0) == 1 ? 1 : 0,
                'is_active_cancer' => ($row['is_active_cancer'] ?? 0) == 1 ? 1 : 0,
                'is_cirrhosis' => ($row['is_cirrhosis'] ?? 0) == 1 ? 1 : 0,
                'is_bed_ridden' => ($row['is_bed_ridden'] ?? 0) == 1 ? 1 : 0,
                'is_dm_hba1c_over_8' => ($row['is_dm_hba1c_over_8'] ?? 0) == 1 ? 1 : 0,
                'is_alcoholism' => ($row['is_alcoholism'] ?? 0) == 1 ? 1 : 0,
                'is_copd' => ($row['is_copd'] ?? 0) == 1 ? 1 : 0,
                'is_bmi_less_18_5' => ($row['is_bmi_less_18_5'] ?? 0) == 1 ? 1 : 0,
                'is_cxr_extensive' => ($row['is_cxr_extensive'] ?? 0) == 1 ? 1 : 0,
                'is_consult_doctor' => ($row['is_consult_doctor'] ?? 0) == 1 ? 1 : 0,
                
                // ข้อมูลเพิ่มเติม
                'treatment_method' => $row['treatment_method'] ?? null,
                'is_lft_tested' => ($row['is_lft_tested'] ?? 0) == 1 ? 1 : 0, // สันนิษฐานว่าเป็นติ๊ก 1=เลือก เช่นกัน
                'nat2_diplotype' => $row['nat2_diplotype'] ?? null,
                'dot_status' => $row['dot_status'] ?? null,
                'treatment_result' => $row['treatment_result'] ?? null,
                
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Insert ทีละ 500 records เพื่อไม่ให้ฐานข้อมูลทำงานหนักเกินไป
        foreach (array_chunk($individualInsert, 500) as $chunk) {
            DB::table($tableIndividual)->insert($chunk);
        }

        // --- ส่วนที่ 2: จัดการตารางสรุป (Hospital Summary) ---
        if (!empty($summaryRows)) {
            // ลบข้อมูลสรุปเก่าของปีนั้นๆ ออกก่อน
            if (!empty($docYears)) {
                DB::table($tableSummary)->whereIn('doc_year', $docYears)->delete();
            }

            $summaryInsert = [];
            $mainYear = $docYears[0] ?? $byear ?? date('Y');

            foreach ($summaryRows as $sRow) {
                // ข้ามถ้าไม่มีชื่อโรงพยาบาล
                if (empty($sRow['hospital_name'])) continue;

                $summaryInsert[] = [
                    'doc_year' => $mainYear,
                    'hospital_name' => $sRow['hospital_name'],
                    'walk_in_count' => isset($sRow['walk_in_count']) && $sRow['walk_in_count'] !== "" ? (int)$sRow['walk_in_count'] : 0,
                    'screening_count' => isset($sRow['screening_count']) && $sRow['screening_count'] !== "" ? (int)$sRow['screening_count'] : 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            
            if (!empty($summaryInsert)) {
                DB::table($tableSummary)->insert($summaryInsert);
            }
        }

        DB::commit();

        return response()->json([
            'status' => 'success',
            'message' => 'บันทึกข้อมูลผู้ป่วย ' . count($individualInsert) . ' รายการ เรียบร้อยแล้ว',
            'summary_saved' => !empty($summaryInsert)
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'status' => 'error', 
            'message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage(),
            'line' => $e->getLine() // เอาไว้ดีบักว่าพังบรรทัดไหน
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
