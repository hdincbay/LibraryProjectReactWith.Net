using LibraryProject.Repositories.Contract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Repositories.Concrete
{
    public class RepositoryManager : IRepositoryManager
    {
        private readonly IAuthorRepository _authorRepository;
        private readonly IBookRepository _bookRepository;
        private readonly RepositoryContext _context;

        public RepositoryManager(IAuthorRepository authorRepository, IBookRepository bookRepository, RepositoryContext context)
        {
            _authorRepository = authorRepository;
            _bookRepository = bookRepository;
            _context = context;
        }

        public IAuthorRepository Author => _authorRepository;

        public IBookRepository Book => _bookRepository;

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}
