using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Services.Contract
{
    public interface IServiceManager
    {
        public IAuthorService AuthorService { get; }
        public IBookService BookService { get; }
    }
}
