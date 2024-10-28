using LibraryProject.Services.Contract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Services.Concrete
{
    public class ServiceManager : IServiceManager
    {
        private readonly IAuthorService _authorService;
        private readonly IBookService _bookService;
        private readonly ILoanService _loanService;

        public ServiceManager(IAuthorService authorService, IBookService bookService, ILoanService loanService)
        {
            _authorService = authorService;
            _bookService = bookService;
            _loanService = loanService;
        }

        public IAuthorService AuthorService => _authorService;

        public IBookService BookService => _bookService;

        public ILoanService LoanService => _loanService;
    }
}
