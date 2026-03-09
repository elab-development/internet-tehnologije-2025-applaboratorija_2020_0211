<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('samples', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type')->nullable();
            $table->string('source')->nullable();
            $table->string('location')->nullable();
            $table->text('metadata')->nullable();
            $table->foreignId('experiment_id')->constrained('experiments')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('samples');
    }
};
