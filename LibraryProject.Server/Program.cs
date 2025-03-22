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
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Bellek tabanl� �nbellek ve Session yap�land�rmas�
builder.Services.AddDistributedMemoryCache(); // �erez tabanl� oturum y�netimi i�in
builder.Services.AddSession(options =>
{
    options.Cookie.Name = ".MyApp.Session"; // �erez ad�
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Oturum s�resi
    options.Cookie.HttpOnly = true; // �erez yaln�zca HTTP �zerinden eri�ilebilir
    options.Cookie.IsEssential = true; // �erez zaruri olmal�d�r (GDPR uyumu i�in)
});

// CORS yap�land�rmas�
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", corspolicybuilder =>
    {
        corspolicybuilder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// JWT Authentication yap�land�rmas�
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme; // JWT kullan�m�
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
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!)),
        ClockSkew = TimeSpan.Zero  // Token s�resi ile sunucu saati aras�ndaki fark� tolere etmeyin (bu, g�venli�i art�rabilir)
    };
});

builder.Services.AddSingleton<JwtTokenService>();

// DbContext ve Identity yap�land�rmas�
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

// Repository ve Service yap�land�rmalar�
builder.Services.AddScoped<IAuthorRepository, AuthorRepository>();
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IRepositoryManager, RepositoryManager>();

builder.Services.AddScoped<IAuthorService, AuthorService>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IServiceManager, ServiceManager>();

builder.Services.AddScoped<Tool>();

// Controller ve Swagger yap�land�rmalar�
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Statis dosyalar ve varsay�lan dosya ayarlar�
app.UseDefaultFiles();
app.UseStaticFiles();

// Swagger kullan�m� geli�tirme ortam�nda
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Session, CORS, Authentication ve Authorization middleware s�ras�
app.UseSession(); // Session'� en �nce tan�ml�yoruz
app.UseCors("AllowAllOrigins"); // CORS politikas�n� tan�ml�yoruz

app.UseHttpsRedirection(); // HTTPS y�nlendirme
app.UseAuthentication();  // JWT do�rulama i�lemi
app.UseAuthorization();   // Yetkilendirme i�lemi

app.MapControllers(); // Controller'lar� tan�ml�yoruz

app.MapFallbackToFile("/index.html"); // SPA kullan�m� i�in fallback

app.Run();
