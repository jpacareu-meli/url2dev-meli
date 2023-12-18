function init() {
  const btn = document.querySelector("#current-tab");
  const btnNewTab = document.querySelector("#new-tab");
  const port = document.querySelector("#port");
  const subdomainProd = document.querySelector("#subdomain-prod");
  const subdomainDev = document.querySelector("#subdomain-dev");

  const onOpen = async () => {
    const portVal = await getValue("port");
    const subProdVal = await getValue("subdomainProd");
    const subDevVal = await getValue("subdomainDev");
    port.value = portVal !== undefined ? portVal : port.value;
    subdomainProd.value =
      subProdVal !== undefined ? subProdVal : subdomainProd.value;
    subdomainDev.value =
      subDevVal !== undefined ? subDevVal : subdomainDev.value;
  };

  const eventHandler = (event) => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      async function ([activeTab]) {
        const matchBeforeDot = /([^\.]+)/;
        const activeURL = new URL(activeTab.url);
        if (activeURL.port === "8443") {
          activeURL.port = "";
          activeURL.host = activeURL.host.replace(
            matchBeforeDot,
            subdomainProd.value
          );
        } else {
          activeURL.port = port.value;
          activeURL.host = activeURL.host.replace(
            matchBeforeDot,
            subdomainDev.value
          );
        }
        await setValue("port", port.value);
        await setValue("subdomainProd", subdomainProd.value);
        await setValue("subdomainDev", subdomainDev.value);

        if (event.target.id === "new-tab") {
          chrome.tabs.create({
            active: true,
            url: activeURL.toString(),
          });
        } else {
          chrome.tabs.update(activeTab.id, {
            url: activeURL.toString(),
          });
        }
      }
    );
  };

  btn && btn.addEventListener("click", eventHandler);
  btnNewTab && btnNewTab.addEventListener("click", eventHandler);
  onOpen();
}

function setValue(key, value) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, function () {
      resolve(value);
    });
  });
}

function getValue(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], function (result) {
      resolve(result[key]);
    });
  });
}

init();
