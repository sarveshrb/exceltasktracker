// Create a pie chart of task status
function createPieChart(tasks) {
    const statuses = ['Done', 'Pending', 'In Progress', 'Delayed'];
    
    // Count the number of tasks in each status
    const counts = {};
    statuses.forEach(status => {
      counts[status] = tasks.filter(task => task.status === status).length;
    });
    
    // Set the data for the chart
    const data = {
      labels: statuses,
      datasets: [{
        data: statuses.map(status => counts[status]),
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#F44336']
      }]
    };
    
    // Create the chart
    const chartElement = document.getElementById('chart');
    const chart = new Chart(chartElement, {
      type: 'pie',
      data: data
    });
  }
  
  // Get tasks data from server and create pie chart
  // fetch('/api/tasks')
  //   .then(response => response.json())
  //   .then(tasks => {
  //     createPieChart(tasks);
  //   })
  //   .catch(error => {
  //     console.error(error);
  //   });
  