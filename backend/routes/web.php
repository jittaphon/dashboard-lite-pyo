<?php

/** @var \Laravel\Lumen\Routing\Router $router */

// CORS Preflight
$router->options('/{any:.*}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        ->header('Cache-Control', 'no-store');
});

// ==============================================
// API Version 1
// ==============================================
$router->group([
    'prefix' => 'api/v1',
    'middleware' => 'throttle:10000,1' 
], function () use ($router) {

    // ยุบเหลือชั้นเดียว ไม่ต้องซ้อน api/v1 อีกรอบ
    $router->group(['prefix' => 'kpi'], function () use ($router) {
        
      $router->get('groups-kpi/{year}', 'KpiController@getGroupsKpiByYear');
        
      $router->get('ncd-kpi-department/{year}', 'KpiController@getNcdKpiDeparment');

    });
});

// สำหรับทดสอบ API (อยู่นอกกลุ่ม)
$router->get('/', function () {
    return response()->json([
        'app' => 'KPI Reporting System',
        'version' => '1.0.0',
        'status' => 'running'
    ]);
});

$router->get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
});