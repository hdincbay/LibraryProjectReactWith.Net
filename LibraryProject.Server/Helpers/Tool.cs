﻿using LibraryProject.Entities.Model;
using LibraryProject.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Cryptography;
using System.Text.RegularExpressions;

namespace LibraryProject.Server.Helpers
{
    public class Tool
    {
        private readonly RepositoryContext _context;
        public Tool(RepositoryContext context)
        {
            _context = context;
        }

        public string GetSerialNumber(IEnumerable<Book> bookList)
        {
            var serialNumberList = bookList.OrderByDescending(a => a.SerialNumber).ToList();
            string newNumber = "00001";
            if (serialNumberList.Count > 0)
            {
                string pattern = @"(?<=B).*"; // B'den sonrasını alacak regex

                Regex regex = new Regex(pattern);
                Match match = regex.Match(serialNumberList[0].SerialNumber!);
                
                if (match.Success)
                {
                    Console.WriteLine("Sonrası: " + match.Value);
                    var newNumberInt = Convert.ToInt32(match.Value) + 1;
                    newNumber = newNumberInt.ToString("D5");

                }
                else
                {
                    Console.WriteLine("Eşleşme bulunamadı.");
                }
            }
            Random random = new Random();
            string serialNumber;

            do
            {
                serialNumber = "B" + newNumber;

                // Serial numarasını veritabanında kontrol et
            }
            while (_context.Book!.Any(b => b.SerialNumber!.Equals(serialNumber)));

            return serialNumber;

        }
    }
}
