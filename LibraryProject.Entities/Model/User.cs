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
        [Key]
        public int UserId { get; set; }
        public ICollection<Loan> Loans { get; set; } = new List<Loan>(); // Üyenin ödünç aldığı kitaplar
        public int BookCount { get; set; } = 0;

    }
}
