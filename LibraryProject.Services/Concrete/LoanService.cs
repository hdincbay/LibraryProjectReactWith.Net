using LibraryProject.Entities.Model;
using LibraryProject.Repositories.Contract;
using LibraryProject.Services.Contract;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryProject.Services.Concrete
{
    public class LoanService : ILoanService
    {
        private readonly IRepositoryManager _manager;

        public LoanService(IRepositoryManager manager)
        {
            _manager = manager;
        }

        public void CreateOne(Loan loan)
        {
            _manager.Loan.CreateOneLoan(loan);
            _manager.Save();
        }

        public void DeleteOne(int id)
        {
            var model = _manager.Loan.GetOneLoan(id, true);
            if(model is not null)
            {
                _manager.Loan.DeleteOneLoan(model);
                _manager.Save();
            }
        }

        public IEnumerable<Loan?> GetAll(bool trackChanges) => _manager.Loan.GetAllLoans(trackChanges);

        public Loan? GetOne(int id, bool trackChanges) => _manager.Loan.GetOneLoan(id, trackChanges);

        public void UpdateOne(Loan loan)
        {
            var model = _manager.Loan.GetOneLoan(loan.LoanId, true);
            if (model is not null)
            {
                _manager.Loan.UpdateOneLoan(model);
                _manager.Save();
            }
        }
    }
}
