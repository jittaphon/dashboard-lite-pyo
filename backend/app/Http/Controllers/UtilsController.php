<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Laravel\Lumen\Routing\Controller as BaseController;
use Illuminate\Http\Request;
use Carbon\Carbon; // จำเป็นสำหรับการจัดการวันที่

class UtilsController extends BaseController
{
    public function getHcodeListFull()
    {
        try {
            $priorityHospitals = [10717, 10718, 11184, 11185, 11186, 11187, 11188, 40744, 40745];

            $hcodeFullList = DB::table('Hcode')
                ->select(
                    'Hcode',
                    DB::raw("CONCAT(Hcode, ' ', name_Hcode) AS HmainOP_FULL")
                )
                ->orderByRaw(
                    'CASE WHEN Hcode IN (' . implode(',', $priorityHospitals) . ') THEN 0 ELSE 1 END'
                )
                ->orderBy('HmainOP_FULL')
                ->get();

            // เพิ่มสถานบริการเพิ่มเติม (จะแทรกหลัง priority hospitals)
            $additionalHospitals = collect([
                ['Hcode' => '00043', 'HmainOP_FULL' => '00043 สำนักงานสาธารณสุขจังหวัดพะเยา'],
                ['Hcode' => '00605', 'HmainOP_FULL' => '00605 สำนักงานสาธารณสุขอำเภอเมืองพะเยา'],
                ['Hcode' => '00606', 'HmainOP_FULL' => '00606 สำนักงานสาธารณสุขอำเภอจุน'],
                ['Hcode' => '00607', 'HmainOP_FULL' => '00607 สำนักงานสาธารณสุขอำเภอเชียงคำ'],
                ['Hcode' => '00608', 'HmainOP_FULL' => '00608 สำนักงานสาธารณสุขอำเภอเชียงม่วน'],
                ['Hcode' => '00609', 'HmainOP_FULL' => '00609 สำนักงานสาธารณสุขอำเภอดอกคำใต้'],
                ['Hcode' => '00610', 'HmainOP_FULL' => '00610 สำนักงานสาธารณสุขอำเภอปง'],
                ['Hcode' => '00611', 'HmainOP_FULL' => '00611 สำนักงานสาธารณสุขอำเภอแม่ใจ'],
                ['Hcode' => '00612', 'HmainOP_FULL' => '00612 สำนักงานสาธารณสุขอำเภอภูซาง'],
                ['Hcode' => '14156', 'HmainOP_FULL' => '14156 สำนักงานสาธารณสุขอำเภอภูกามยาว'],
            ]);

            // แยกข้อมูลออกเป็น priority และ non-priority
            $priorityList = $hcodeFullList->filter(function ($item) use ($priorityHospitals) {
                return in_array($item->Hcode, $priorityHospitals);
            });

            $nonPriorityList = $hcodeFullList->filter(function ($item) use ($priorityHospitals) {
                return !in_array($item->Hcode, $priorityHospitals);
            });

            // รวมข้อมูลตามลำดับ: priority -> additional -> non-priority
            $hcodeFullList = $priorityList->concat($additionalHospitals)->concat($nonPriorityList);

            return response()->json([
                'status' => 'success',
                'data' => $hcodeFullList->values(), // reset index
                'message' => 'Successfully retrieved Hcode full list.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve Hcode full list: ' . $e->getMessage()
            ], 500);
        }
    }
    public function getListAffiliation()
    {
        try {
            $typeHosList = DB::table('Hcode')
                ->select('type_hos')
                ->whereNotNull('type_hos') // ป้องกันไม่ให้เอาค่า NULL มาแสดงใน filter
                ->distinct()
                ->orderBy('type_hos')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $typeHosList,
                'message' => 'Successfully retrieved type_hos list.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve type_hos list: ' . $e->getMessage()
            ], 500);
        }
    }
}
