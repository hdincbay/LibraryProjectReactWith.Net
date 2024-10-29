using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Entities.Model
{
    public class Loan
    {
        public Loan()
        {
            Book!.LoanDate = DateTime.UtcNow;
        }

        public int LoanId { get; set; }
        public int? BookId { get; set; }
        public Book? Book { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
    }
}
