using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(x =>
        x.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IBankService, BankService>();


// DbContext using SQLite
builder.Services.AddDbContext<BankDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("BankDb") ?? "Data Source=bank.db"));

// Password hasher for user passwords
builder.Services.AddScoped<Microsoft.AspNetCore.Identity.IPasswordHasher<UserProfile>, Microsoft.AspNetCore.Identity.PasswordHasher<UserProfile>>();

// Add a DB initializer service (for seeding)
builder.Services.AddScoped<IDbSeeder, DbSeeder>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

// global exception middleware (simple)
app.UseMiddleware<GlobalExceptionMiddleware>();

app.MapControllers();

// Seed DB on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var seeder = services.GetRequiredService<IDbSeeder>();
    seeder.Seed().GetAwaiter().GetResult();
}

app.Run();
