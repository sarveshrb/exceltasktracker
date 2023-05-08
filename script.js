// When the user submits the form
document.querySelector('form').addEventListener('submit', handleFormSubmit);

function handleFormSubmit(event) {
  event.preventDefault(); // prevent the default form submission
  const input = document.querySelector('#file');
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Convert sheet data to JSON format
    const jsonTasks = XLSX.utils.sheet_to_json(sheet);
    // Parse JSON data and extract task details
    const tasks = jsonTasks.map((task) => ({
      name: task['Task Description'],
      owner: task['Owner'],
      doer: task['Doer'],
      number: task['Task Number'],
      status: task['Status'],
    }));
    // Create table rows dynamically
    const tableBody = document.getElementById('task-table');
    tableBody.innerHTML = '';
    tasks.forEach((task) => {
      const row = document.createElement('tr');
      row.innerHTML = ` <td>${task.number}</td> <td>${task.name}</td> <td>${task.owner}</td> <td>${task.doer}</td> <td>${task.status}</td> `;
      tableBody.appendChild(row);
    });
    // Create pie chart
    createPieChart(tasks);

    // Get owner's email address
    let ownerEmail = '';
    let minNumber = Infinity;
    for (let task of tasks) {
      if (task.number < minNumber) {
        minNumber = task.number;
        ownerEmail = task.owner;
      }
    }

    // Send email
    sendEmail(ownerEmail, tasks); // pass ownerEmail and tasks as arguments
  };
  reader.readAsArrayBuffer(input.files[0]); // read the uploaded file
}

// Declare a global variable to store the chart object
let chart;

function createPieChart(tasks) {
  // Destroy the old chart if it exists
  if (chart) {
    chart.destroy();
  }
  // Create a new chart
  const ctx = document.getElementById('chart').getContext('2d');
  const labels = ['Completed', 'In Progress', 'Not Started'];
  const data = [0, 0, 0];
  tasks.forEach((task) => {
    switch (task.status) {
      case 'Completed':
        data[0]++;
        break;
      case 'In Progress':
        data[1]++;
        break;
      case 'Not Started':
        data[2]++;
        break;
    }
  });
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Task Status',
          data: data,
          backgroundColor: ['green', 'orange', 'red'],
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Task Status Pie Chart',
        },
      },
    },
  });
}

function sendEmail(ownerEmail, tasks) {
  const url = 'https://api.sendinblue.com/v3/smtp/email';
  const chartCanvas = document.querySelector('#chart');

  // Create a table from the tasks data
  let tableHtml = '<table border="1">';
  tableHtml += '<tr><th>Task Number</th><th>Task Description</th><th>Owner</th><th>Doer</th><th>Status</th></tr>';
  tasks.forEach((task) => {
    tableHtml += `<tr><td>${task.number}</td><td>${task.name}</td><td>${task.owner}</td><td>${task.doer}</td><td>${task.status}</td></tr>`;
  });
  tableHtml += '</table>';


  // Create an image from the chart data
const chartDataUrl = chartCanvas.toDataURL('image/jpeg', 0.8); // use JPEG format with 80% quality
const imageData = chartDataUrl.substring('data:image/jpeg;base64,'.length); // change the prefix accordingly
const imageHtml = `<img src="data:image/jpeg;base64,${imageData}" alt="Pie Chart">`; // change the content type accordingly

  // Create the mail data with HTML content
  const mailData = {
    sender: {
      name: 'Omkar Gangurde',
      email: 'sunnyclgg@gmail.com',
    },
    to: [
      { email: 'omkar.22010918@viit.ac.in' },
      { email: 'sunnyclgg@gmail.com' },
    ],
    subject: 'Task Management Dashboard Status',
    htmlContent: `Please find the spreadsheet and pie chart of task status below.<br>${tableHtml}<br>${imageHtml}`,
  };

  fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'api-key': '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',
    },
    body: JSON.stringify(mailData),
  })
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
}