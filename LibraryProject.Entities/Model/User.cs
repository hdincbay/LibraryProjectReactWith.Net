using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Entities.Model
{
    public class User : IdentityUser<int>
    {
        public int BookCount { get; set; } = 0;
        public string? t_chatId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public ICollection<Book>? Books { get; set; } = new List<Book>();

    }
}
