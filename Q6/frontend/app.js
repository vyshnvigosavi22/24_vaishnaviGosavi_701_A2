const select = document.getElementById("countrySelect");
const details = document.getElementById("countryDetails");

fetch("https://restcountries.com/v3.1/all")
  .then(res => res.json())
  .then(data => {
    data.sort((a, b) => a.name.common.localeCompare(b.name.common));
    data.forEach(country => {
      const opt = document.createElement("option");
      opt.value = country.cca2;
      opt.textContent = country.name.common;
      select.appendChild(opt);
    });

    select.addEventListener("change", () => {
      const code = select.value;
      if (code) {
        fetch(`/api/country/${code}`)
          .then(res => res.json())
          .then(data => {
            details.textContent = JSON.stringify(data, null, 2);
          })
          .catch(err => {
            details.textContent = "Error fetching country data";
            console.error(err);
          });
      }
    });
  });
