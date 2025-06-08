using LibraryProject.Entities.Model;
using LibraryProject.Repositories;
using LibraryProject.Repositories.Concrete;
using LibraryProject.Repositories.Contract;
using LibraryProject.Server.Helpers;
using LibraryProject.Services.Concrete;
using LibraryProject.Services.Contract;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
Log.Logger = new LoggerConfiguration()
    .Enrich.WithThreadId()
    .WriteTo.Console(outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level}] [Thread ID: {ThreadId}] {Message}{NewLine}{Exception}")
    .WriteTo.File("Logs/LogFile_.log", rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level}] [Thread ID: {ThreadId}] {Message}{NewLine}{Exception}")
    .CreateLogger();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog();
// Bellek tabanlý önbellek ve Session yapýlandýrmasý
builder.Services.AddDistributedMemoryCache(); // Çerez tabanlý oturum yönetimi için
builder.Services.AddSession(options =>
{
    options.Cookie.Name = ".MyApp.Session"; // Çerez adý
    options.IdleTimeout = TimeSpan.FromMinutes(3); // Oturum süresi
    options.Cookie.HttpOnly = true; // Çerez yalnýzca HTTP üzerinden eriþilebilir
    options.Cookie.IsEssential = true;
});

// CORS yapýlandýrmasý
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", corspolicybuilder =>
    {
        corspolicybuilder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// JWT Authentication yapýlandýrmasý
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme; // JWT kullanýmý
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["jwtSettings:Issuer"],
        ValidAudience = builder.Configuration["jwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["jwtSettings:SecretKey"]!)),
        RequireExpirationTime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddSingleton<JwtTokenService>();

builder.Services.AddDbContext<RepositoryContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("pgsqlconnection"), b => b.MigrationsAssembly("LibraryProject.Server")));

builder.Services.AddIdentity<User, Role>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.User.AllowedUserNameCharacters = "abcdefghijklmnoprstuvyz1234567890";
    options.Password.RequiredLength = 6;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = false;
    options.Password.RequireDigit = false;
}).AddEntityFrameworkStores<RepositoryContext>();

// Repository ve Service yapýlandýrmalarý
builder.Services.AddScoped<IAuthorRepository, AuthorRepository>();
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IRepositoryManager, RepositoryManager>();

builder.Services.AddScoped<IAuthorService, AuthorService>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IServiceManager, ServiceManager>();

builder.Services.AddScoped<Tool>();

// Controller ve Swagger yapýlandýrmalarý
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Statis dosyalar ve varsayýlan dosya ayarlarý
app.UseDefaultFiles();
app.UseStaticFiles();

// Swagger kullanýmý geliþtirme ortamýnda
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Session, CORS, Authentication ve Authorization middleware sýrasý
app.UseSession();
app.UseCors("AllowAllOrigins"); // CORS politikasýný tanýmý

app.UseHttpsRedirection(); // HTTPS yönlendirme
app.UseAuthentication();  // JWT doðrulama iþlemi
app.UseAuthorization();   // Yetkilendirme iþlemi

app.MapControllers(); // Controller tanýmý

app.MapFallbackToFile("/index.html"); // SPA kullanýmý için fallback

app.Run();
