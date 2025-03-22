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

// Bellek tabanlý önbellek ve Session yapýlandýrmasý
builder.Services.AddDistributedMemoryCache(); // Çerez tabanlý oturum yönetimi için
builder.Services.AddSession(options =>
{
    options.Cookie.Name = ".MyApp.Session"; // Çerez adý
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Oturum süresi
    options.Cookie.HttpOnly = true; // Çerez yalnýzca HTTP üzerinden eriþilebilir
    options.Cookie.IsEssential = true; // Çerez zaruri olmalýdýr (GDPR uyumu için)
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
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!)),
        ClockSkew = TimeSpan.Zero  // Token süresi ile sunucu saati arasýndaki farký tolere etmeyin (bu, güvenliði artýrabilir)
    };
});

builder.Services.AddSingleton<JwtTokenService>();

// DbContext ve Identity yapýlandýrmasý
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
app.UseSession(); // Session'ý en önce tanýmlýyoruz
app.UseCors("AllowAllOrigins"); // CORS politikasýný tanýmlýyoruz

app.UseHttpsRedirection(); // HTTPS yönlendirme
app.UseAuthentication();  // JWT doðrulama iþlemi
app.UseAuthorization();   // Yetkilendirme iþlemi

app.MapControllers(); // Controller'larý tanýmlýyoruz

app.MapFallbackToFile("/index.html"); // SPA kullanýmý için fallback

app.Run();
