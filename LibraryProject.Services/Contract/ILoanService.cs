using LibraryProject.Entities.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Services.Contract
{
    public interface ILoanService
    {
        public IEnumerable<Loan?> GetAll(bool trackChanges);
        public Loan? GetOne(int id, bool trackChanges);
        public void CreateOne(Loan loan);
        public void UpdateOne(int id);  
        public void DeleteOne(int id);
    }
}
