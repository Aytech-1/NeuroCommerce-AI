<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');

        $permissionsTable = $tableNames['permissions'] ?? 'permissions';
        $rolesTable = $tableNames['roles'] ?? 'roles';
        $modelHasPermissionsTable = $tableNames['model_has_permissions'] ?? 'model_has_permissions';
        $modelHasRolesTable = $tableNames['model_has_roles'] ?? 'model_has_roles';
        $roleHasPermissionsTable = $tableNames['role_has_permissions'] ?? 'role_has_permissions';

        $rolePivotKey = $columnNames['role_pivot_key'] ?? 'role_id';
        $permissionPivotKey = $columnNames['permission_pivot_key'] ?? 'permission_id';
        $modelMorphKey = $columnNames['model_morph_key'] ?? 'model_id';

        Schema::create($permissionsTable, function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 150);
            $table->string('guard_name', 50)->default('api');
            $table->string('module', 50)->nullable();
            $table->string('description', 500)->nullable();
            $table->timestamps();

            $table->unique(['name', 'guard_name']);
            $table->index('module');
        });

        Schema::create($rolesTable, function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('guard_name', 50)->default('api');
            $table->string('description', 500)->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->unique(['name', 'guard_name']);
            $table->index('is_system');
        });

        Schema::create($modelHasPermissionsTable, function (Blueprint $table) use ($permissionsTable, $permissionPivotKey, $modelMorphKey) {
            $table->uuid($permissionPivotKey);
            $table->string('model_type');
            $table->uuid($modelMorphKey);
            $table->index([$modelMorphKey, 'model_type'], 'model_has_permissions_model_id_model_type_index');

            $table->foreign($permissionPivotKey)
                ->references('id')
                ->on($permissionsTable)
                ->onDelete('cascade');

            $table->primary(
                [$permissionPivotKey, $modelMorphKey, 'model_type'],
                'model_has_permissions_permission_model_type_primary'
            );
        });

        Schema::create($modelHasRolesTable, function (Blueprint $table) use ($rolesTable, $rolePivotKey, $modelMorphKey) {
            $table->uuid($rolePivotKey);
            $table->string('model_type');
            $table->uuid($modelMorphKey);
            $table->index([$modelMorphKey, 'model_type'], 'model_has_roles_model_id_model_type_index');

            $table->foreign($rolePivotKey)
                ->references('id')
                ->on($rolesTable)
                ->onDelete('cascade');

            $table->primary(
                [$rolePivotKey, $modelMorphKey, 'model_type'],
                'model_has_roles_role_model_type_primary'
            );
        });

        Schema::create($roleHasPermissionsTable, function (Blueprint $table) use ($permissionsTable, $rolesTable, $permissionPivotKey, $rolePivotKey) {
            $table->uuid($permissionPivotKey);
            $table->uuid($rolePivotKey);

            $table->foreign($permissionPivotKey)
                ->references('id')
                ->on($permissionsTable)
                ->onDelete('cascade');

            $table->foreign($rolePivotKey)
                ->references('id')
                ->on($rolesTable)
                ->onDelete('cascade');

            $table->primary(
                [$permissionPivotKey, $rolePivotKey],
                'role_has_permissions_permission_id_role_id_primary'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names');

        $permissionsTable = $tableNames['permissions'] ?? 'permissions';
        $rolesTable = $tableNames['roles'] ?? 'roles';
        $modelHasPermissionsTable = $tableNames['model_has_permissions'] ?? 'model_has_permissions';
        $modelHasRolesTable = $tableNames['model_has_roles'] ?? 'model_has_roles';
        $roleHasPermissionsTable = $tableNames['role_has_permissions'] ?? 'role_has_permissions';

        Schema::dropIfExists($roleHasPermissionsTable);
        Schema::dropIfExists($modelHasRolesTable);
        Schema::dropIfExists($modelHasPermissionsTable);
        Schema::dropIfExists($rolesTable);
        Schema::dropIfExists($permissionsTable);
    }
};
