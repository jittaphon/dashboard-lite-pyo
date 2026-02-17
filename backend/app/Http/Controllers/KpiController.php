<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KpiController extends Controller
{
    /**
     * ดึงข้อมูล KPI ทั้งหมด จัดกลุ่มตามกลุ่มงาน (ส่งให้ React)
     */


    public function getGroupsKpiByYear($year)
{
    $data = DB::select("
        SELECT 
            g.id   AS group_id,
            g.name AS group_name,
            k.id   AS kpi_id,
            k.code AS kpi_code,
            k.name AS kpi_name,
            k.report_url,
            ky.threshold,
            ky.weight
        FROM groups g
        LEFT JOIN (
            SELECT k.*, ky.threshold, ky.weight, ky.fiscal_year
            FROM kpis k
            JOIN kpi_years ky 
                ON ky.kpi_id = k.id
                AND ky.fiscal_year = ?
                AND ky.is_active = 1
        ) k ON k.group_id = g.id
        LEFT JOIN kpi_years ky 
            ON ky.kpi_id = k.id
            AND ky.fiscal_year = ?
            AND ky.is_active = 1
        ORDER BY g.id, k.id
    ", [$year, $year]);

    return response()->json($data, 200, [], JSON_UNESCAPED_UNICODE);
}


    /**
     * ดึงค่าจาก DB อื่นมาหยอดใส่ DB หลัก (Sync Logic)
     */

public function getNcdKpiDeparment($year)
{
    try {

        $province = '56';

        $data = DB::select("
            SELECT * FROM (

                SELECT 
                    '1_ht_screening' AS indicator_group,
                    b_year AS fiscal_year,
                    province AS province_code,
                    SUM(COALESCE(target,0)) AS total_target,
                    SUM(COALESCE(result,0)) AS total_result,
                    ROUND(IF(SUM(target) > 0,(SUM(result)/SUM(target))*100,0),2) AS total_percent
                FROM db_ncd_one.kpi_s_ht_screen
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province

                UNION ALL

                SELECT 
                    '2_ht_followup' AS indicator_group,
                    b_year AS fiscal_year,
                    province AS province_code,
                    SUM(COALESCE(targetq1,0)+COALESCE(targetq2,0)+COALESCE(targetq3,0)+COALESCE(targetq4,0)) AS total_target,
                    SUM(COALESCE(resultq1,0)+COALESCE(resultq2,0)+COALESCE(resultq3,0)+COALESCE(resultq4,0)) AS total_result,
                    ROUND(IF(
                        SUM(COALESCE(targetq1,0)+COALESCE(targetq2,0)+COALESCE(targetq3,0)+COALESCE(targetq4,0)) > 0,
                        (SUM(COALESCE(resultq1,0)+COALESCE(resultq2,0)+COALESCE(resultq3,0)+COALESCE(resultq4,0)) /
                         SUM(COALESCE(targetq1,0)+COALESCE(targetq2,0)+COALESCE(targetq3,0)+COALESCE(targetq4,0))) * 100,
                        0
                    ),2) AS total_percent
                FROM db_ncd_one.kpi_s_repleate2
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province

                UNION ALL

                SELECT 
                    '3_ht_control' AS indicator_group,
                    b_year AS fiscal_year,
                    province AS province_code,
                    SUM(COALESCE(target,0)) AS total_target,
                    SUM(COALESCE(result_bp1_d,0)) AS total_result,
                    ROUND(IF(SUM(target) > 0,(SUM(result_bp1_d)/SUM(target))*100,0),2) AS total_percent
                FROM db_ncd_one.kpi_s_ht_control_new
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province

                UNION ALL

                SELECT 
                    '4_dm_control' AS indicator_group,
                    b_year AS fiscal_year,
                    province AS province_code,
                    SUM(CAST(target AS UNSIGNED)) AS total_target,
                    SUM(CAST(hba1c AS UNSIGNED)) AS total_result,
                    ROUND(IF(SUM(CAST(target AS UNSIGNED)) > 0,
                        (SUM(CAST(hba1c AS UNSIGNED))/SUM(CAST(target AS UNSIGNED)))*100,0),2) AS total_percent
                FROM db_ncd_one.kpi_s_dm_control
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province

                UNION ALL

                SELECT 
                    '5_dm_screen' AS indicator_group,
                    b_year AS fiscal_year,
                    province AS province_code,
                    SUM(CAST(target AS UNSIGNED)) AS total_target,
                    SUM(CAST(result AS UNSIGNED)) AS total_result,
                    ROUND(IF(SUM(CAST(target AS UNSIGNED)) > 0,
                        (SUM(CAST(result AS UNSIGNED))/SUM(CAST(target AS UNSIGNED)))*100,0),2) AS total_percent
                FROM db_ncd_one.kpi_s_dm_screen
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province

                UNION ALL

                SELECT 
                    '6_dm_followup' AS indicator_group,
                    b_year AS fiscal_year,
                    province AS province_code,
                    SUM(COALESCE(targetq1,0)+COALESCE(targetq2,0)+COALESCE(targetq3,0)+COALESCE(targetq4,0)) AS total_target,
                    SUM(COALESCE(resultq1,0)+COALESCE(resultq2,0)+COALESCE(resultq3,0)+COALESCE(resultq4,0)) AS total_result,
                    ROUND(IF(
                        SUM(COALESCE(targetq1,0)+COALESCE(targetq2,0)+COALESCE(targetq3,0)+COALESCE(targetq4,0)) > 0,
                        (SUM(COALESCE(resultq1,0)+COALESCE(resultq2,0)+COALESCE(resultq3,0)+COALESCE(resultq4,0)) /
                         SUM(COALESCE(targetq1,0)+COALESCE(targetq2,0)+COALESCE(targetq3,0)+COALESCE(targetq4,0))) * 100,
                        0
                    ),2) AS total_percent
                FROM db_ncd_one.kpi_s_repleate1
                WHERE province = ? AND b_year = ?
                GROUP BY b_year, province

            ) AS final_summary
            ORDER BY indicator_group ASC
        ", [
            $province, $year,
            $province, $year,
            $province, $year,
            $province, $year,
            $province, $year,
            $province, $year
        ]);

        return response()->json($data, 200, [], JSON_UNESCAPED_UNICODE);

    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
}



}