
const cursorGlow = document.querySelector('.cursor-glow');

window.addEventListener('mousemove', (e) => {

  cursorGlow.style.left = e.clientX - 150 + 'px';
  cursorGlow.style.top = e.clientY - 150 + 'px';

});

function scrollToTracker(){

  document.getElementById('tracker').scrollIntoView({
    behavior:'smooth'
  });

}

function calculatePeriod(){

  let lastDate = document.getElementById('lastDate').value;
  let cycleLength = parseInt(document.getElementById('cycleLength').value);

  if(lastDate === ''){
    alert('Please select a date');
    return;
  }

  let last = new Date(lastDate);

  let next = new Date(last);
  next.setDate(last.getDate() + cycleLength);

  let ovulation = new Date(next);
  ovulation.setDate(next.getDate() - 14);

  let fertileStart = new Date(ovulation);
  fertileStart.setDate(ovulation.getDate() - 4);

  let today = new Date();

  let diff = next - today;

  let daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if(daysLeft < 0){
    daysLeft = 0;
  }

  document.getElementById('nextPeriod').innerHTML = next.toDateString();

  document.getElementById('ovulation').innerHTML = ovulation.toDateString();

  document.getElementById('fertility').innerHTML = fertileStart.toDateString();

  document.getElementById('daysLeftHero').innerHTML = daysLeft;
  document.getElementById('ringDays').innerHTML = daysLeft;

  let progress = ((cycleLength - daysLeft) / cycleLength) * 440;

  document.getElementById('progressCircle').style.strokeDashoffset = 440 - progress;

  updateChart(cycleLength, daysLeft);

  updateAIInsight(daysLeft);

}

function updateAIInsight(days){

  let insight = document.getElementById('aiInsight');

  if(days <= 3){

    insight.innerHTML = 'Your cycle may begin soon. Prioritize iron-rich foods and hydration 🌸';

  }
  else if(days <= 10){

    insight.innerHTML = 'Ovulation phase approaching. Focus on protein and sleep ✨';

  }
  else{

    insight.innerHTML = 'Your wellness rhythm looks balanced today 💖';

  }

}

let chart;

function updateChart(total, left){

  let completed = total - left;

  const ctx = document.getElementById('cycleChart');

  if(chart){
    chart.destroy();
  }

  chart = new Chart(ctx, {

    type:'doughnut',

    data:{
      labels:['Completed','Remaining'],

      datasets:[{
        data:[completed,left],

        backgroundColor:[
          '#ff4f81',
          '#7f5cff'
        ],

        borderWidth:0
      }]
    },

    options:{
      responsive:true,
      cutout:'72%',

      plugins:{

        legend:{
          labels:{
            color:'white'
          }
        }

      }
    }

  });

}

updateChart(28,5);

let water = 4;

function increaseWater(){

  if(water < 8){

    water++;

    document.getElementById('waterText').innerHTML = `${water} / 8 Glasses`;

    document.getElementById('waterFill').style.width = (water/8)*100 + '%';

  }

}

function setMood(mood){

  document.getElementById('moodResult').innerHTML = `Today's mood: ${mood}`;

}

window.onload = () => {

  let today = new Date().toISOString().split('T')[0];

  document.getElementById('lastDate').value = today;

  calculatePeriod();

}
``