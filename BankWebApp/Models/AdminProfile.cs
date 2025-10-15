using System.ComponentModel.DataAnnotations;

namespace BankWebApp.Models
{
    public class AdminProfile
    {
        [Required, StringLength(100)]
        public string Name { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Phone, StringLength(30)]
        public string Phone { get; set; }

        [Url, Display(Name = "Profile Image URL")]
        public string ProfileImageUrl { get; set; }

        public AdminProfile() { }

        public AdminProfile(string name, string email, string phone, string profileImageUrl)
        {
            Name = name;
            Email = email;
            Phone = phone;
            ProfileImageUrl = profileImageUrl;
        }
    }
}
