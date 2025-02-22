using LibraryProject.Entities.Model;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Repositories
{
    public class RepositoryContext : IdentityDbContext<User, Role, int>
    {
        public RepositoryContext(DbContextOptions options) : base(options)
        {
        }
        public DbSet<Book>? Book { get; set; }
        public DbSet<Author>? Author { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<Book>()
                .HasOne(b => b.Author)
                .WithMany(a => a.Books)
                .HasForeignKey(b => b.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Book>()
                .HasOne(b => b.User)
                .WithMany(u => u.Books)
                .HasForeignKey(b => b.UserId);

            builder.Entity<User>().Property(u => u.Id).ValueGeneratedOnAdd();
        }
    }
}
