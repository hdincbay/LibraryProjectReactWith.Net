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
        public ICollection<Loan> Loans { get; set; } = new List<Loan>();
        public int BookCount { get; set; } = 0;
        public string? t_chatId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

    }
}
