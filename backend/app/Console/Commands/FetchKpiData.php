<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class FetchKpiData extends Command
{
    protected $signature = 'kpi:fetch';
    protected $description = 'ดึงข้อมูล KPI และสร้างคอลัมน์ province จาก areacode 2 ตัวหน้า';

    public function handle()
    {
        ini_set('memory_limit', '512M'); 
        set_time_limit(0);

        $this->info('🚀 Starting Dynamic Fetch Process with Province Mapping...');
        $client = new Client();
        $url = "https://opendata.moph.go.th/api/report_data";
        $years = ["2566", "2567", "2568", "2569"];
        $provinces = ["50", "51", "52", "54", "55", "56", "57", "58"];
        
        $tableName = 'kpi_s_ncd_screen_repleate1'; 
        $allData = [];

        foreach ($years as $year) {
            foreach ($provinces as $proCode) {
                try {
                    $this->info("Fetching: Year $year | Province $proCode");
                    $response = $client->post($url, [
                        'headers' => [
                            'Content-Type' => 'application/json',
                            'Accept'       => 'application/json',
                        ],
                        'json' => [
                            "tableName" => "s_ncd_screen_repleate1",
                            "year"      => $year,
                            "province"  => $proCode,
                            "type"      => "json"
                        ],
                        'timeout' => 120 
                    ]);

                    $body = json_decode($response->getBody(), true);

                    if (!empty($body) && is_array($body)) {
                        foreach ($body as $item) {
                            // --- ส่วนที่ปรับปรุง: สร้างคอลัมน์ province ใหม่ ---
                            // ตัดเอา 2 หลักแรกจาก areacode ถ้าไม่มีให้ใช้ $proCode จากลูปแทน
                            $item['province'] = isset($item['areacode']) ? substr($item['areacode'], 0, 2) : $proCode;
                            
                            $item['created_at'] = date('Y-m-d H:i:s');
                            $item['updated_at'] = date('Y-m-d H:i:s');
                            $allData[] = $item;
                        }
                    }
                } catch (\Exception $e) {
                    $this->error("❌ Error at $proCode ($year): " . $e->getMessage());
                }
            }
        }

        if (!empty($allData)) {
            // --- ส่วนที่ 1: สร้างตารางอัตโนมัติ ---
            if (!Schema::hasTable($tableName)) {
                Schema::create($tableName, function (Blueprint $table) use ($allData) {
                    $table->increments('id_local');
                    
                    // บังคับสร้างคอลัมน์ province เป็นอันดับต้นๆ เพื่อความสวยงาม
                    $table->string('province', 5)->nullable()->index(); 

                    foreach ($allData[0] as $key => $value) {
                        // ป้องกันการสร้างคอลัมน์ซ้ำกับที่นิยามไว้ด้านบน
                        if (!in_array($key, ['id_local', 'province', 'created_at', 'updated_at'])) {
                            $table->text($key)->nullable(); 
                        }
                    }
                    $table->timestamps();
                });
                $this->info("✨ Table [$tableName] created with 'province' column.");
            }

            // --- ส่วนที่ 2: ล้างข้อมูลและ Insert ใหม่ ---
            $this->warn("Truncating and inserting " . count($allData) . " rows...");
            
            DB::table($tableName)->truncate();
            
            foreach (array_chunk($allData, 500) as $chunk) {
                DB::table($tableName)->insert($chunk);
            }

            $this->info("✅ Done! Data stored with province codes.");
        } else {
            $this->error('⚠️ No data found from API.');
        }
    }
}