using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Entities.Model
{
    public class Author
    {
        public int AuthorId { get; set; }
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public ICollection<Book>? Books { get; set; } = new List<Book>();
    }
}
