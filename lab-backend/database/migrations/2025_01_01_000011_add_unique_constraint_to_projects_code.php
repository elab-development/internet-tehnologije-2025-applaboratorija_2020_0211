<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * TIP MIGRACIJE #3: Dodavanje UNIQUE CONSTRAINT na existing kolonu
     *
     * Problem: Projekti mogu imati isti 'code' što dovodi do konfuzije.
     * Rešenje: Dodaj UNIQUE constraint na 'code' kolonu da osiguraš jedinstvene kodove.
     *
     * Ovo je treći tip migracije:
     * 1. CREATE TABLE (2025_01_01_000001 i dalje)
     * 2. ADD COLUMN (2025_01_01_000009 i dalje)
     * 3. ALTER TABLE - dodaj constraint (ova migracija)
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Dodaj UNIQUE constraint na 'code' kolonu ako već nije prisutan
            $table->unique('code')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Ukloni UNIQUE constraint
            $table->dropUnique(['code']);
        });
    }
};
