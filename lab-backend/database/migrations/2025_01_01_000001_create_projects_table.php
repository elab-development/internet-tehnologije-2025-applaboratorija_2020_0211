<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('code');
            $table->text('description')->nullable();
            $table->decimal('budget', 15, 2)->nullable();
            $table->string('status')->default('planning'); // planning|active|completed|archived
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('document_path')->nullable();

            // FK – vođa projekta
            $table->foreignId('lead_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
