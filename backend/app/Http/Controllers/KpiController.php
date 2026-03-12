<?php

namespace App\Http\Controllers;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable; // ใช้ Throwable เพื่อดักจับทุก Error

class KpiController extends Controller
{
    /**
     * ดึงข้อมูล KPI ทั้งหมด จัดกลุ่มตามกลุ่มงาน
     */
public function getGroupsKpiByYear($year)
{
    try {
        $data = DB::select("
            SELECT 
                g.id      AS group_id,
                g.name    AS group_name,
                kpi_data.id      AS kpi_id,
                kpi_data.uuid    AS kpi_uuid, -- ดึง UUID ออกมาใช้งาน
                kpi_data.code    AS kpi_code,
                kpi_data.name    AS kpi_name,
                kpi_data.report_url,
                kpi_data.threshold,
                kpi_data.weight
            FROM groups g
            LEFT JOIN (
                SELECT 
                    k.id, 
                    k.uuid, -- เพิ่มการดึง uuid จากตาราง kpis
                    k.group_id, 
                    k.code, 
                    k.name, 
                    k.report_url,
                    ky.threshold, 
                    ky.weight
                FROM kpis k
                INNER JOIN kpi_years ky ON k.id = ky.kpi_id
                WHERE ky.fiscal_year = ? 
                  AND ky.is_active = 1
            ) AS kpi_data ON g.id = kpi_data.group_id
            ORDER BY g.id ASC, kpi_data.id ASC
        ", [$year]);

        return response()->json($data, 200, [], JSON_UNESCAPED_UNICODE);
    } catch (Throwable $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}
    /**
     * บันทึกหรือแก้ไขตัวชี้วัด (KPI) และเกณฑ์เป้าหมาย (Threshold)
     */
   public function saveKpi(Request $request)
{
    if (!$request->group_id || !$request->year) {
        return response()->json(['status' => 'error', 'message' => 'กรุณาระบุกลุ่มงานและปีงบประมาณ'], 400);
    }

    DB::beginTransaction();
    try {
        $kpi_id = $request->kpi_id;
        if ($kpi_id === 'null' || !$kpi_id) { $kpi_id = null; }

        // เตรียมข้อมูลพื้นฐาน
        $kpi_params = [
            'group_id'   => $request->group_id,
            'code'       => $request->kpi_code,
            'name'       => $request->kpi_name,
            'report_url' => $request->report_url,
            'target_connection' => $request->target_connection, 
            'target_table'      => $request->target_table
        ];

        if ($kpi_id) {
            // --- กรณี UPDATE ---
            // ใช้ id เดิมในการค้นหาและอัปเดต ไม่ต้องแตะต้อง UUID
            DB::table('kpis')->where('id', $kpi_id)->update($kpi_params);
        } else {
            // --- กรณี INSERT ---
            // เจน UUID ใหม่และใส่เข้าไปพร้อมข้อมูลอื่น
            $kpi_params['uuid'] = (string) Str::uuid(); 
            $kpi_id = DB::table('kpis')->insertGetId($kpi_params);
        }

        // จัดการตาราง kpi_years (ยังคงใช้ kpi_id ที่เป็นตัวเลขเพื่อเชื่อมความสัมพันธ์)
        DB::table('kpi_years')->updateOrInsert(
            [
                'kpi_id'      => $kpi_id,
                'fiscal_year' => $request->year
            ],
            [
                'threshold'  => $request->threshold ?? 0,
                'weight'     => $request->weight ?? 1,
                'is_active'  => 1
            ]
        );

        // ดึงข้อมูล UUID กลับมาโชว์ที่หน้าบ้าน
        $current_kpi = DB::table('kpis')->where('id', $kpi_id)->first();

        DB::commit();
        return response()->json([
            'status' => 'success', 
            'message' => 'บันทึกสำเร็จ',
            'data' => [
                'id' => $kpi_id,
                'uuid' => $current_kpi->uuid
            ]
        ]);
    } catch (Throwable $e) {
        DB::rollBack();
        return response()->json(['status' => 'error', 'message' => 'DB Error: ' . $e->getMessage()], 500);
    }
}
    
    // ฟังก์ชัน saveGroup ให้แก้เช่นกัน
    public function saveGroup(Request $request)
    {
        try {
            $id = $request->id;
            $data = ['name' => $request->name];

            if ($id) {
                DB::table('groups')->where('id', $id)->update($data);
            } else {
                DB::table('groups')->insert($data);
            }
            return response()->json(['status' => 'success', 'message' => 'สำเร็จ']);
        } catch (Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * ลบตัวชี้วัด
     */
   public function deleteKpi($id)
    {
        DB::beginTransaction();
        try {
            DB::table('kpi_years')->where('kpi_id', $id)->delete();
            DB::table('kpis')->where('id', $id)->delete();
            DB::commit();
            return response()->json(['status' => 'success', 'message' => 'ลบข้อมูลสำเร็จ']);
        } catch (Throwable $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }


    /**
     * ลบกลุ่มงาน
     */
    public function deleteGroup($id)
    {
        try {
            // Check if has KPIs
            $hasKpi = DB::table('kpis')->where('group_id', $id)->exists();
            if ($hasKpi) {
                return response()->json(['status' => 'error', 'message' => 'ไม่สามารถลบได้ เนื่องจากมีตัวชี้วัดใช้งานอยู่'], 400);
            }

            DB::table('groups')->where('id', $id)->delete();
            return response()->json(['status' => 'success', 'message' => 'ลบกลุ่มงานสำเร็จ']);
        } catch (Throwable $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

public function getTopicDetail($uuid, $year)
{
    try {
        // STEP 1: หา Config จาก DB หลัก (db_kpi_hub)
        $kpi = DB::table('kpis')->where('uuid', $uuid)->first();

        if (!$kpi) {
            return response()->json(['status' => 'error', 'message' => 'ไม่พบรายงาน'], 404);
        }

        // STEP 2: เตรียมชื่อ Database กลุ่มงาน
        $targetDb = env('DB_DISEASE_CONTROL_DATABASE', 'db_disease_control');
        $tableName = $kpi->target_table; 

        if (!$tableName) {
            return response()->json(['status' => 'error', 'message' => 'รายงานนี้ไม่ได้ระบุชื่อตารางข้อมูลดิบ'], 422);
        }

        // STEP 3: กวาดข้อมูลจาก DB กลุ่มงาน
        $fullPath = $targetDb . '.' . $tableName;
        $results = DB::table($fullPath)
                    ->where('byear', $year) 
                    ->get();

        // STEP 4: Format ข้อมูล
        $formattedData = $results->map(function ($item) {
            $row = (array)$item;
            if (isset($row['update_at'])) {
                $row['update_at_th'] = \Carbon\Carbon::parse($row['update_at'])
                                        ->addYears(543)
                                        ->format('d/m/Y H:i');
            }
            return $row;
        });

        // STEP 5: แก้ไขตรงนี้เพื่อดึง chart_type จาก DB
        // ใช้ explode เปลี่ยนจาก string "bar,table,donut" ให้เป็น array ['bar', 'table', 'donut']
        $supportedCharts = $kpi->chart_type 
            ? explode(',', $kpi->chart_type) 
            : ['bar', 'table', 'donut']; // fallback ถ้าใน DB เป็นค่าว่าง

        $visualizations = [
            'supported_charts' => $supportedCharts,
            'chart_config' => [
                // ในเมื่อไม่ได้เพิ่ม col ใน DB ก็ส่งชื่อ Field กลางๆ ไปก่อน 
                // หรือส่ง null ไปให้ React ไปตัดสินใจเองจากชื่อ Key ใน JSON
                'label_field' => null, 
                'value_fields' => []
            ]
        ];

        return response()->json([
            'status' => 'success',
            'config' => [
                'title' => $kpi->name,
                'code' => $kpi->code,
                'unit' => $kpi->unit ?? 'ร้อยละ'
            ],
            'visualizations' => $visualizations,
            'data' => $formattedData
        ], 200, [], JSON_UNESCAPED_UNICODE);

    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error', 
            'message' => 'Backend Error: ' . $e->getMessage()
        ], 500);
    } 
}

    /**
     * Sync ข้อมูลจาก NCD Dashboard (คง Logic เดิมของคุณ แต่ครอบ Throwable)
     */
public function getNcdKpiDeparment($year)
{
    try {
        $province = '56';
        $data = DB::select("
            SELECT * FROM (
                -- ชุดที่ 1: ht_screening
                SELECT 
                    '1_ht_screening' AS indicator_group, b_year AS fiscal_year, province AS province_code,
                    SUM(COALESCE(target,0)) AS total_target, SUM(COALESCE(result,0)) AS total_result,
                    ROUND(IF(SUM(COALESCE(target,0)) > 0,(SUM(COALESCE(result,0))/SUM(COALESCE(target,0)))*100,0),2) AS total_percent,
                    MAX(STR_TO_DATE(date_com, '%Y%m%d%H%i')) AS last_processed_at
                FROM db_ncd_one.kpi_s_ht_screen
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province
                
                UNION ALL
                
                -- ชุดที่ 2: ht_followup
                SELECT 
                    '2_ht_followup' AS indicator_group, b_year AS fiscal_year, province AS province_code,
                    SUM(COALESCE(targetq1,0)+COALESCE(targetq2,0)+COALESCE(targetq3,0)+COALESCE(targetq4,0)) AS total_target,
                    SUM(COALESCE(resultq1,0)+COALESCE(resultq2,0)+COALESCE(resultq3,0)+COALESCE(resultq4,0)) AS total_result,
                    ROUND(IF(SUM(COALESCE(targetq1,0)+COALESCE(targetq2,0)+COALESCE(targetq3,0)+COALESCE(targetq4,0)) > 0, (SUM(COALESCE(resultq1,0)+COALESCE(resultq2,0)+COALESCE(resultq3,0)+COALESCE(resultq4,0)) / SUM(COALESCE(targetq1,0)+COALESCE(targetq2,0)+COALESCE(targetq3,0)+COALESCE(targetq4,0))) * 100, 0),2) AS total_percent,
                    MAX(STR_TO_DATE(date_com, '%Y%m%d%H%i')) AS last_processed_at
                FROM db_ncd_one.kpi_s_repleate2
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province
                
                UNION ALL
                
                -- ชุดที่ 3: ht_control
                SELECT 
                    '3_ht_control' AS indicator_group, b_year AS fiscal_year, province AS province_code,
                    SUM(COALESCE(target,0)) AS total_target, SUM(COALESCE(result_bp1_d,0)) AS total_result,
                    ROUND(IF(SUM(COALESCE(target,0)) > 0,(SUM(COALESCE(result_bp1_d,0))/SUM(COALESCE(target,0)))*100,0),2) AS total_percent,
                    MAX(STR_TO_DATE(date_com, '%Y%m%d%H%i')) AS last_processed_at
                FROM db_ncd_one.kpi_s_ht_control
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province
                
                UNION ALL
                
                -- ชุดที่ 4: dm_control
                SELECT 
                    '4_dm_control' AS indicator_group, b_year AS fiscal_year, province AS province_code,
                    SUM(CAST(COALESCE(target,0) AS UNSIGNED)) AS total_target, SUM(CAST(COALESCE(hba1c,0) AS UNSIGNED)) AS total_result,
                    ROUND(IF(SUM(CAST(COALESCE(target,0) AS UNSIGNED)) > 0,(SUM(CAST(COALESCE(hba1c,0) AS UNSIGNED))/SUM(CAST(COALESCE(target,0) AS UNSIGNED)))*100,0),2) AS total_percent,
                    MAX(STR_TO_DATE(date_com, '%Y%m%d%H%i')) AS last_processed_at
                FROM db_ncd_one.kpi_s_dm_control
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province
                
                UNION ALL
                
                -- ชุดที่ 5: dm_screen
                SELECT 
                    '5_dm_screen' AS indicator_group, b_year AS fiscal_year, province AS province_code,
                    SUM(CAST(COALESCE(target,0) AS UNSIGNED)) AS total_target, SUM(CAST(COALESCE(result,0) AS UNSIGNED)) AS total_result,
                    ROUND(IF(SUM(CAST(COALESCE(target,0) AS UNSIGNED)) > 0,(SUM(CAST(COALESCE(result,0) AS UNSIGNED))/SUM(CAST(COALESCE(target,0) AS UNSIGNED)))*100,0),2) AS total_percent,
                    MAX(STR_TO_DATE(date_com, '%Y%m%d%H%i')) AS last_processed_at
                FROM db_ncd_one.kpi_s_dm_screen
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province
                
                UNION ALL
                
                -- ชุดที่ 6: dm_followup
                SELECT 
                    '6_dm_followup' AS indicator_group, b_year AS fiscal_year, province AS province_code,
                    SUM(COALESCE(targetq1,0)+COALESCE(targetq2,0)+COALESCE(targetq3,0)+COALESCE(targetq4,0)) AS total_target,
                    SUM(COALESCE(resultq1,0)+COALESCE(resultq2,0)+COALESCE(resultq3,0)+COALESCE(resultq4,0)) AS total_result,
                    ROUND(IF(SUM(COALESCE(targetq1,0)+COALESCE(targetq2,0)+COALESCE(targetq3,0)+COALESCE(targetq4,0)) > 0, (SUM(COALESCE(resultq1,0)+COALESCE(resultq2,0)+COALESCE(resultq3,0)+COALESCE(resultq4,0)) / SUM(COALESCE(targetq1,0)+COALESCE(targetq2,0)+COALESCE(targetq3,0)+COALESCE(targetq4,0))) * 100, 0),2) AS total_percent,
                    MAX(STR_TO_DATE(date_com, '%Y%m%d%H%i')) AS last_processed_at
                FROM db_ncd_one.kpi_s_repleate1
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province
                
                UNION ALL
                
                -- ชุดที่ 7: dm_remission
                SELECT 
                    '7_dm_remission' AS indicator_group, b_year AS fiscal_year, province AS province_code,
                    SUM(CAST(COALESCE(target_all, 0) AS UNSIGNED)) AS total_target, 
                    SUM(CAST(COALESCE(target1, 0) + COALESCE(target2, 0) AS UNSIGNED)) AS total_result,
                    ROUND(IF(SUM(CAST(COALESCE(target_all, 0) AS UNSIGNED)) > 0, (SUM(CAST(COALESCE(target1, 0) + COALESCE(target2, 0) AS UNSIGNED)) / SUM(CAST(COALESCE(target_all, 0) AS UNSIGNED))) * 100, 0), 2) AS total_percent,
                    MAX(created_at) AS last_processed_at
                FROM db_ncd_one.kpi_s_dm_remission
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province
            ) AS final_summary
            ORDER BY indicator_group ASC
        ", [
            $province, $year, $province, $year, $province, $year,
            $province, $year, $province, $year, $province, $year,
            $province, $year
        ]);

        return response()->json($data, 200, [], JSON_UNESCAPED_UNICODE);
    } catch (\Throwable $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}
}