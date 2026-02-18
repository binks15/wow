using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "expense_categories",
                columns: table => new
                {
                    pk_category_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    category_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    max_amount_per_day = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_expense_categories", x => x.pk_category_id);
                });

            migrationBuilder.CreateTable(
                name: "games",
                columns: table => new
                {
                    pk_game_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    game_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    operating_hours_start = table.Column<TimeSpan>(type: "time", nullable: false),
                    operating_hours_end = table.Column<TimeSpan>(type: "time", nullable: false),
                    slot_duration_minutes = table.Column<int>(type: "int", nullable: false),
                    max_players_per_slot = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_games", x => x.pk_game_id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    RoleId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles", x => x.RoleId);
                });

            migrationBuilder.CreateTable(
                name: "game_slots",
                columns: table => new
                {
                    pk_slot_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fk_game_id = table.Column<long>(type: "bigint", nullable: false),
                    start_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_slots", x => x.pk_slot_id);
                    table.ForeignKey(
                        name: "FK_game_slots_games_fk_game_id",
                        column: x => x.fk_game_id,
                        principalTable: "games",
                        principalColumn: "pk_game_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    pk_user_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    password_salt = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    full_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    date_of_birth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    date_of_joining = table.Column<DateTime>(type: "datetime2", nullable: false),
                    profile_photo_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    designation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    fk_manager_id = table.Column<long>(type: "bigint", nullable: true),
                    fk_role_id = table.Column<long>(type: "bigint", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    hash_refresh_token = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    refresh_token_expiry = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.pk_user_id);
                    table.ForeignKey(
                        name: "FK_users_roles_fk_role_id",
                        column: x => x.fk_role_id,
                        principalTable: "roles",
                        principalColumn: "RoleId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_users_users_fk_manager_id",
                        column: x => x.fk_manager_id,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "game_bookings",
                columns: table => new
                {
                    pk_booking_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fk_game_id = table.Column<long>(type: "bigint", nullable: false),
                    fk_slot_id = table.Column<long>(type: "bigint", nullable: false),
                    booking_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    slot_start_time = table.Column<TimeSpan>(type: "time", nullable: false),
                    slot_end_time = table.Column<TimeSpan>(type: "time", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    fk_created_by = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    cancelled_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_bookings", x => x.pk_booking_id);
                    table.ForeignKey(
                        name: "FK_game_bookings_game_slots_fk_slot_id",
                        column: x => x.fk_slot_id,
                        principalTable: "game_slots",
                        principalColumn: "pk_slot_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_bookings_games_fk_game_id",
                        column: x => x.fk_game_id,
                        principalTable: "games",
                        principalColumn: "pk_game_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_game_bookings_users_fk_created_by",
                        column: x => x.fk_created_by,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "game_history",
                columns: table => new
                {
                    pk_stat_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fk_user_id = table.Column<long>(type: "bigint", nullable: false),
                    fk_game_id = table.Column<long>(type: "bigint", nullable: false),
                    cycle_start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    cycle_end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    slots_played = table.Column<int>(type: "int", nullable: false),
                    last_played_date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_history", x => x.pk_stat_id);
                    table.ForeignKey(
                        name: "FK_game_history_games_fk_game_id",
                        column: x => x.fk_game_id,
                        principalTable: "games",
                        principalColumn: "pk_game_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_history_users_fk_user_id",
                        column: x => x.fk_user_id,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_slot_requests",
                columns: table => new
                {
                    pk_request_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fk_slot_id = table.Column<long>(type: "bigint", nullable: false),
                    fk_requested_by = table.Column<long>(type: "bigint", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    requested_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_slot_requests", x => x.pk_request_id);
                    table.ForeignKey(
                        name: "FK_game_slot_requests_game_slots_fk_slot_id",
                        column: x => x.fk_slot_id,
                        principalTable: "game_slots",
                        principalColumn: "pk_slot_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_slot_requests_users_fk_requested_by",
                        column: x => x.fk_requested_by,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    pk_notification_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fk_user_id = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notifications", x => x.pk_notification_id);
                    table.ForeignKey(
                        name: "FK_notifications_users_fk_user_id",
                        column: x => x.fk_user_id,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "travels",
                columns: table => new
                {
                    pk_travel_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    travel_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    destination = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    purpose = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    fk_created_by = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_travels", x => x.pk_travel_id);
                    table.ForeignKey(
                        name: "FK_travels_users_fk_created_by",
                        column: x => x.fk_created_by,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "user_game_interests",
                columns: table => new
                {
                    pk_interest_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fk_user_id = table.Column<long>(type: "bigint", nullable: false),
                    fk_game_id = table.Column<long>(type: "bigint", nullable: false),
                    is_interested = table.Column<bool>(type: "bit", nullable: false),
                    registered_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_game_interests", x => x.pk_interest_id);
                    table.ForeignKey(
                        name: "FK_user_game_interests_games_fk_game_id",
                        column: x => x.fk_game_id,
                        principalTable: "games",
                        principalColumn: "pk_game_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_game_interests_users_fk_user_id",
                        column: x => x.fk_user_id,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_refresh_tokens",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    TokenHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByIp = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReplacedByTokenHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_refresh_tokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_refresh_tokens_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_booking_participants",
                columns: table => new
                {
                    pk_participant_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fk_booking_id = table.Column<long>(type: "bigint", nullable: false),
                    fk_user_id = table.Column<long>(type: "bigint", nullable: false),
                    joined_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_booking_participants", x => x.pk_participant_id);
                    table.ForeignKey(
                        name: "FK_game_booking_participants_game_bookings_fk_booking_id",
                        column: x => x.fk_booking_id,
                        principalTable: "game_bookings",
                        principalColumn: "pk_booking_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_booking_participants_users_fk_user_id",
                        column: x => x.fk_user_id,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "game_slot_request_participants",
                columns: table => new
                {
                    pk_request_participant_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fk_request_id = table.Column<long>(type: "bigint", nullable: false),
                    fk_user_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_slot_request_participants", x => x.pk_request_participant_id);
                    table.ForeignKey(
                        name: "FK_game_slot_request_participants_game_slot_requests_fk_request_id",
                        column: x => x.fk_request_id,
                        principalTable: "game_slot_requests",
                        principalColumn: "pk_request_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_slot_request_participants_users_fk_user_id",
                        column: x => x.fk_user_id,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "expenses",
                columns: table => new
                {
                    pk_expense_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fk_travel_id = table.Column<long>(type: "bigint", nullable: false),
                    fk_employee_id = table.Column<long>(type: "bigint", nullable: false),
                    fk_category_id = table.Column<long>(type: "bigint", nullable: false),
                    amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    currency = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    expense_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    submitted_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    reviewed_by = table.Column<long>(type: "bigint", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    hr_remarks = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_expenses", x => x.pk_expense_id);
                    table.ForeignKey(
                        name: "FK_expenses_expense_categories_fk_category_id",
                        column: x => x.fk_category_id,
                        principalTable: "expense_categories",
                        principalColumn: "pk_category_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_expenses_travels_fk_travel_id",
                        column: x => x.fk_travel_id,
                        principalTable: "travels",
                        principalColumn: "pk_travel_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_expenses_users_fk_employee_id",
                        column: x => x.fk_employee_id,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_expenses_users_reviewed_by",
                        column: x => x.reviewed_by,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "travel_assignments",
                columns: table => new
                {
                    pk_assignment_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fk_travel_id = table.Column<long>(type: "bigint", nullable: false),
                    fk_employee_id = table.Column<long>(type: "bigint", nullable: false),
                    assigned_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_travel_assignments", x => x.pk_assignment_id);
                    table.ForeignKey(
                        name: "FK_travel_assignments_travels_fk_travel_id",
                        column: x => x.fk_travel_id,
                        principalTable: "travels",
                        principalColumn: "pk_travel_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_travel_assignments_users_fk_employee_id",
                        column: x => x.fk_employee_id,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "travel_documents",
                columns: table => new
                {
                    pk_document_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fk_travel_id = table.Column<long>(type: "bigint", nullable: false),
                    fk_employee_id = table.Column<long>(type: "bigint", nullable: true),
                    fk_uploaded_by = table.Column<long>(type: "bigint", nullable: false),
                    owner_type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    document_type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    file_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    file_path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    uploaded_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_travel_documents", x => x.pk_document_id);
                    table.ForeignKey(
                        name: "FK_travel_documents_travels_fk_travel_id",
                        column: x => x.fk_travel_id,
                        principalTable: "travels",
                        principalColumn: "pk_travel_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_travel_documents_users_fk_employee_id",
                        column: x => x.fk_employee_id,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_travel_documents_users_fk_uploaded_by",
                        column: x => x.fk_uploaded_by,
                        principalTable: "users",
                        principalColumn: "pk_user_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "expense_proofs",
                columns: table => new
                {
                    pk_proof_id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    fk_expense_id = table.Column<long>(type: "bigint", nullable: false),
                    file_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    file_path = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    file_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    uploaded_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_expense_proofs", x => x.pk_proof_id);
                    table.ForeignKey(
                        name: "FK_expense_proofs_expenses_fk_expense_id",
                        column: x => x.fk_expense_id,
                        principalTable: "expenses",
                        principalColumn: "pk_expense_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_expense_proofs_fk_expense_id",
                table: "expense_proofs",
                column: "fk_expense_id");

            migrationBuilder.CreateIndex(
                name: "IX_expenses_fk_category_id",
                table: "expenses",
                column: "fk_category_id");

            migrationBuilder.CreateIndex(
                name: "IX_expenses_fk_employee_id",
                table: "expenses",
                column: "fk_employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_expenses_fk_travel_id",
                table: "expenses",
                column: "fk_travel_id");

            migrationBuilder.CreateIndex(
                name: "IX_expenses_reviewed_by",
                table: "expenses",
                column: "reviewed_by");

            migrationBuilder.CreateIndex(
                name: "IX_game_booking_participants_fk_booking_id",
                table: "game_booking_participants",
                column: "fk_booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_game_booking_participants_fk_user_id",
                table: "game_booking_participants",
                column: "fk_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_game_bookings_fk_created_by",
                table: "game_bookings",
                column: "fk_created_by");

            migrationBuilder.CreateIndex(
                name: "IX_game_bookings_fk_game_id",
                table: "game_bookings",
                column: "fk_game_id");

            migrationBuilder.CreateIndex(
                name: "IX_game_bookings_fk_slot_id",
                table: "game_bookings",
                column: "fk_slot_id");

            migrationBuilder.CreateIndex(
                name: "IX_game_history_fk_game_id",
                table: "game_history",
                column: "fk_game_id");

            migrationBuilder.CreateIndex(
                name: "IX_game_history_fk_user_id_fk_game_id_cycle_start_date_cycle_end_date",
                table: "game_history",
                columns: new[] { "fk_user_id", "fk_game_id", "cycle_start_date", "cycle_end_date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_game_slot_request_participants_fk_request_id",
                table: "game_slot_request_participants",
                column: "fk_request_id");

            migrationBuilder.CreateIndex(
                name: "IX_game_slot_request_participants_fk_user_id",
                table: "game_slot_request_participants",
                column: "fk_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_game_slot_requests_fk_requested_by",
                table: "game_slot_requests",
                column: "fk_requested_by");

            migrationBuilder.CreateIndex(
                name: "IX_game_slot_requests_fk_slot_id",
                table: "game_slot_requests",
                column: "fk_slot_id");

            migrationBuilder.CreateIndex(
                name: "IX_game_slots_fk_game_id",
                table: "game_slots",
                column: "fk_game_id");

            migrationBuilder.CreateIndex(
                name: "IX_games_game_name",
                table: "games",
                column: "game_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_notifications_fk_user_id",
                table: "notifications",
                column: "fk_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_roles_Name",
                table: "roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_travel_assignments_fk_employee_id",
                table: "travel_assignments",
                column: "fk_employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_travel_assignments_fk_travel_id",
                table: "travel_assignments",
                column: "fk_travel_id");

            migrationBuilder.CreateIndex(
                name: "IX_travel_documents_fk_employee_id",
                table: "travel_documents",
                column: "fk_employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_travel_documents_fk_travel_id",
                table: "travel_documents",
                column: "fk_travel_id");

            migrationBuilder.CreateIndex(
                name: "IX_travel_documents_fk_uploaded_by",
                table: "travel_documents",
                column: "fk_uploaded_by");

            migrationBuilder.CreateIndex(
                name: "IX_travels_fk_created_by",
                table: "travels",
                column: "fk_created_by");

            migrationBuilder.CreateIndex(
                name: "IX_user_game_interests_fk_game_id",
                table: "user_game_interests",
                column: "fk_game_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_game_interests_fk_user_id_fk_game_id",
                table: "user_game_interests",
                columns: new[] { "fk_user_id", "fk_game_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_refresh_tokens_TokenHash",
                table: "user_refresh_tokens",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_refresh_tokens_UserId",
                table: "user_refresh_tokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_fk_manager_id",
                table: "users",
                column: "fk_manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_fk_role_id",
                table: "users",
                column: "fk_role_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "expense_proofs");

            migrationBuilder.DropTable(
                name: "game_booking_participants");

            migrationBuilder.DropTable(
                name: "game_history");

            migrationBuilder.DropTable(
                name: "game_slot_request_participants");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "travel_assignments");

            migrationBuilder.DropTable(
                name: "travel_documents");

            migrationBuilder.DropTable(
                name: "user_game_interests");

            migrationBuilder.DropTable(
                name: "user_refresh_tokens");

            migrationBuilder.DropTable(
                name: "expenses");

            migrationBuilder.DropTable(
                name: "game_bookings");

            migrationBuilder.DropTable(
                name: "game_slot_requests");

            migrationBuilder.DropTable(
                name: "expense_categories");

            migrationBuilder.DropTable(
                name: "travels");

            migrationBuilder.DropTable(
                name: "game_slots");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "games");

            migrationBuilder.DropTable(
                name: "roles");
        }
    }
}
