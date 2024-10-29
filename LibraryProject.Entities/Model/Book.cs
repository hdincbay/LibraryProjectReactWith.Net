using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Entities.Model
{
    public class Book
    {
        public Book()
        {
            CreatedDate = DateTime.UtcNow;
        }
        public int BookId { get; set; }
        public string? Name { get; set; }
        public string? SerialNumber { get; set; }
        public int AuthorId { get; set; }
        public Author? Author { get; set; }
        public bool Available { get; set; } = true;
        public DateTime LoanDate { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
