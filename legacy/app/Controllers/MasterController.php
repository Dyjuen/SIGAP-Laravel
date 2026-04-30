<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Response;
use App\Models\Iku;
use App\Models\KategoriBelanja;
use App\Models\Satuan;

class MasterController extends Controller
{
    public function getIku()
    {
        $ikuModel = new Iku;
        $data = $ikuModel->findAll();
        Response::success($data, 'Data IKU berhasil diambil.');
    }

    public function getTipeKegiatan()
    {
        try {
            $this->db->query('SELECT * FROM m_tipe_kegiatan ORDER BY tipe_kegiatan_id ASC');
            $rows = $this->db->resultSet();
            Response::success($rows);
        } catch (\PDOException $e) {
            Response::error($e->getMessage());
        }
    }

    public function getSatuan()
    {
        $satuanModel = new Satuan;
        $data = $satuanModel->findAll();
        Response::success($data, 'Data Satuan berhasil diambil.');
    }

    public function getKategoriBelanja()
    {
        $kategoriBelanjaModel = new KategoriBelanja;
        $data = $kategoriBelanjaModel->findAll();
        Response::success($data, 'Data Kategori Belanja berhasil diambil.');
    }
}
