<?php

namespace App\Core;

class Database
{
    // Ambil konstanta dari config/database.php
    private $host = \DB_HOST;

    private $user = \DB_USER;

    private $pass = \DB_PASS;

    private $dbname = \DB_NAME;

    private $dbh; // Database Handler (koneksi PDO)

    private $stmt; // Statement (query)

    private $error;

    // Properti untuk Singleton
    private static $instance = null;

    /**
     * Constructor dibuat private agar tidak bisa di-instansiasi dari luar.
     */
    private function __construct()
    {
        // Set DSN (Data Source Name)
        $dsn = 'mysql:host='.$this->host.';dbname='.$this->dbname.';charset=utf8mb4';

        $options = [
            \PDO::ATTR_PERSISTENT => true, // Koneksi persistent
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION, // Mode error
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC, // Mode fetch default
            \PDO::ATTR_EMULATE_PREPARES => false,
        ];

        // Buat instance PDO
        try {
            $this->dbh = new \PDO($dsn, $this->user, $this->pass, $options);
        } catch (\PDOException $e) {
            $this->error = $e->getMessage();
            // Di production, ganti 'echo' dengan logging error
            exit('Koneksi Database Gagal: '.$this->error);
        }
    }

    /**
     * Metode static untuk mendapatkan satu-satunya instance Database (Singleton).
     */
    public static function getInstance()
    {
        if (self::$instance == null) {
            // Jika belum ada, buat koneksi baru
            self::$instance = new Database;
        }

        // Kembalikan koneksi yang ada
        return self::$instance;
    }

    /**
     * Menyiapkan statement query
     */
    public function query($sql)
    {
        $this->stmt = $this->dbh->prepare($sql);
    }

    /**
     * Melakukan binding nilai ke parameter
     */
    public function bind($param, $value, $type = null)
    {
        if (is_null($type)) {
            switch (true) {
                case is_int($value):
                    $type = \PDO::PARAM_INT;
                    break;
                case is_bool($value):
                    $type = \PDO::PARAM_BOOL;
                    break;
                case is_null($value):
                    $type = \PDO::PARAM_NULL;
                    break;
                default:
                    $type = \PDO::PARAM_STR;
            }
        }
        $this->stmt->bindValue($param, $value, $type);
    }

    /**
     * Eksekusi statement yang sudah disiapkan
     */
    public function execute()
    {
        return $this->stmt->execute();
    }

    /**
     * Dapatkan hasil query sebagai array of objects/assoc
     */
    public function resultSet()
    {
        $this->execute();

        return $this->stmt->fetchAll();
    }

    /**
     * Dapatkan satu baris hasil query
     */
    public function single()
    {
        $this->execute();

        return $this->stmt->fetch();
    }

    /**
     * Dapatkan jumlah baris yang terpengaruh
     */
    public function rowCount()
    {
        return $this->stmt->rowCount();
    }

    /**
     * Dapatkan ID terakhir yang di-insert
     */
    public function lastInsertId()
    {
        return $this->dbh->lastInsertId();
    }

    public function getConnection()
    {
        return $this->dbh;
    }

    // ============================================
    // ✅ TAMBAHKAN METHOD TRANSACTION DI SINI
    // ============================================

    /**
     * Memulai transaction
     */
    public function beginTransaction()
    {
        return $this->dbh->beginTransaction();
    }

    /**
     * Commit transaction (simpan semua perubahan)
     */
    public function commit()
    {
        return $this->dbh->commit();
    }

    /**
     * Rollback transaction (batalkan semua perubahan)
     */
    public function rollBack()
    {
        return $this->dbh->rollBack();
    }

    /**
     * Cek apakah sedang dalam transaction
     */
    public function inTransaction()
    {
        return $this->dbh->inTransaction();
    }
}
