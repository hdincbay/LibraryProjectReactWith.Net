using LibraryProject.Entities.Model;
using LibraryProject.Repositories;
using Microsoft.EntityFrameworkCore;
using System;

namespace LibraryProject.Server.Helpers
{
    public class Tool
    {
        private readonly RepositoryContext _context;
        public Tool(RepositoryContext context)
        {
            _context = context;
        }

        public string GetSerialNumber()
        {
            Random random = new Random();
            string serialNumber;

            do
            {
                int randomNumber = random.Next(10000, 100000);
                serialNumber = "B" + randomNumber.ToString();

                // Serial numarasını veritabanında kontrol et
            }
            while (_context.Book!.Any(b => b.SerialNumber!.Equals(serialNumber)));

            return serialNumber;

        }
    }
}
