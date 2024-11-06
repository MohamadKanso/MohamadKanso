<div align="center">

<!-- ANIMATED HEADER -->
[![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Fira+Code&duration=3000&pause=1000&color=2F81F7&center=true&vCenter=true&multiline=true&random=false&width=1200&height=150&lines=🤖+Machine+Learning+Engineer+%26+Algorithmic+Trader;⚡+Specializing+in+Deep+Learning+%26+Quantitative+Trading;🔬+Building+AI-Powered+Trading+Systems)](https://git.io/typing-svg)

<!-- PROFILE VIEWS & SOCIAL BADGES -->
<div align="center">
  <img src="https://komarev.com/ghpvc/?username=MohamadKanso&style=for-the-badge&color=2F81F7"/>
  <a href="https://www.linkedin.com/in/mohamad-kanso/"><img src="https://img.shields.io/badge/LinkedIn-2F81F7?style=for-the-badge&logo=linkedin&logoColor=white"/></a>
  <a href="https://twitter.com/MoAliKanso"><img src="https://img.shields.io/badge/Twitter-2F81F7?style=for-the-badge&logo=x&logoColor=white"/></a>
</div>

<!-- ML TECH STACK -->
## 🧠 Machine Learning Stack
```mermaid
mindmap
  root((AI & ML))
    Deep Learning
      TensorFlow
      PyTorch
      LSTM Networks
      Neural Architecture Search
    Trading Algorithms
      Reinforcement Learning
      Time Series Analysis
      Quantitative Analysis
    Data Processing
      Pandas
      NumPy
      Scikit-learn
    Cloud & Deploy
      Docker
      AWS
      REST APIs
```

<!-- GITHUB STATS WITH ML EMPHASIS -->
<p align="center">
<img src="https://github-readme-stats.vercel.app/api?username=MohamadKanso&show_icons=true&theme=tokyonight&hide_border=true&bg_color=1A1B27&title_color=2F81F7&icon_color=2F81F7" height="175"/>
<img src="https://github-readme-streak-stats.herokuapp.com/?user=MohamadKanso&theme=tokyonight&hide_border=true&background=1A1B27&ring=2F81F7&fire=2F81F7&currStreakLabel=2F81F7" height="175"/>
</p>

<!-- ML PROJECTS SHOWCASE -->
## 🤖 Machine Learning Projects

<details>
<summary><b>🔥 Bitcoin Trading Bot</b></summary>

### LSTM-based Cryptocurrency Trading System
- Architecture: Bidirectional LSTM with attention mechanism
- Performance: 25.77% profit in backtesting
- Features:
  - Real-time market data processing
  - Custom technical indicators
  - Adaptive position sizing
  - Risk management system

```python
# Sample Architecture
class TradingLSTM(nn.Module):
    def __init__(self, input_dim, hidden_dim, n_layers):
        super(TradingLSTM, self).__init__()
        self.hidden_dim = hidden_dim
        self.n_layers = n_layers
        self.lstm = nn.LSTM(
            input_dim, hidden_dim, n_layers, 
            batch_first=True, bidirectional=True
        )
        self.fc = nn.Linear(hidden_dim * 2, 1)
        
    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        predictions = self.fc(lstm_out[:, -1, :])
        return predictions
```

📊 Performance Metrics:
- Win Rate: 61%
- Risk-Reward Ratio: 3.62
- Sharpe Ratio: 2.1
- Maximum Drawdown: 12.3%
</details>

<details>
<summary><b>🧪 Autonomous AI Research Platform</b></summary>

### Neural Architecture Search System
- Implemented reinforcement learning for architecture optimization
- Automated hyperparameter tuning
- Achieved 20% performance improvement

```python
class NASController(nn.Module):
    def __init__(self, num_layers, num_operations):
        super().__init__()
        self.lstm = nn.LSTM(input_size=num_operations,
                           hidden_size=100,
                           num_layers=2)
        self.linear = nn.Linear(100, num_operations)
        
    def sample_architecture(self):
        # Architecture sampling logic
        arch = []
        hidden = None
        input_tensor = torch.zeros(1, 1, self.num_operations)
        
        for _ in range(self.num_layers):
            output, hidden = self.lstm(input_tensor, hidden)
            logits = self.linear(output)
            probs = F.softmax(logits, dim=-1)
            arch.append(torch.multinomial(probs, 1).item())
        
        return arch
```
</details>

<!-- TECHNICAL EXPERTISE -->
## 💻 Technical Expertise

<table>
<tr>
<td width="50%">

### Machine Learning
```python
expertise = {
    'Deep Learning': ['TensorFlow', 'PyTorch', 'Keras'],
    'ML Algorithms': ['LSTM', 'CNN', 'Transformers'],
    'Optimization': ['Adam', 'RMSprop', 'SGD'],
    'Validation': ['Cross-Val', 'Backtesting']
}
```

</td>
<td width="50%">

### Trading Systems
```python
trading_stack = {
    'Analysis': ['Technical', 'Fundamental', 'Sentiment'],
    'Execution': ['Binance API', 'MetaTrader', 'REST'],
    'Risk Mgmt': ['Position Sizing', 'Stop-Loss'],
    'Backtesting': ['Vectorized', 'Event-Driven']
}
```

</td>
</tr>
</table>

<!-- SKILLS VISUALIZATION -->
<div align="center">
  <img src="https://skillicons.dev/icons?i=python,tensorflow,pytorch,sklearn,pandas,numpy,docker,aws&theme=dark" />
</div>

<!-- ML METRICS -->
## 📊 Trading Performance

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/Model_Accuracy-94.3%25-2F81F7?style=for-the-badge&logo=tensorflow&logoColor=white"/>
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Trading_Win_Rate-61%25-2F81F7?style=for-the-badge&logo=bitcoin&logoColor=white"/>
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/ROI-25.77%25-2F81F7?style=for-the-badge&logo=ethereum&logoColor=white"/>
      </td>
    </tr>
  </table>
</div>

<!-- RECENT ML PUBLICATIONS -->
## 📚 Recent Work
- 🎓 MSc Dissertation: "Deep Learning in Algorithmic Trading"
- 🏆 Computer Vision Challenge Winner (2023)
- 💡 Research: Neural Architecture Search in Trading Systems

<!-- FOOTER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer&animation=twinkling"/>
</div>
