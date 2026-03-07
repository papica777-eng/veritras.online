"""
═══════════════════════════════════════════════════════════════════════════════
🔮 CHRONOS-BOLT - Transformer Model
═══════════════════════════════════════════════════════════════════════════════

Time-series transformer for 7-day test failure prediction.

@author Dimitar Prodromov / QAntum Empire
"""

import torch
import torch.nn as nn
import numpy as np
from typing import Tuple, Optional

class PositionalEncoding(nn.Module):
    """Positional encoding for transformer"""
    
    def __init__(self, d_model: int, max_len: int = 5000):
        super().__init__()
        
        position = torch.arange(max_len).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2) * (-np.log(10000.0) / d_model))
        
        pe = torch.zeros(max_len, 1, d_model)
        pe[:, 0, 0::2] = torch.sin(position * div_term)
        pe[:, 0, 1::2] = torch.cos(position * div_term)
        
        self.register_buffer('pe', pe)
    
    def forward(self, x):
        """Add positional encoding to input"""
        x = x + self.pe[:x.size(0)]
        return x


class ChronosTransformer(nn.Module):
    """
    Time-Series Transformer for Test Failure Prediction
    
    Architecture:
    - Input: [batch, seq_len, features]
    - Positional Encoding
    - Multi-Head Attention (8 heads)
    - Feed-Forward Network
    - Output: [failure_prob, confidence, eta]
    """
    
    def __init__(
        self,
        input_dim: int = 64,
        d_model: int = 256,
        nhead: int = 8,
        num_layers: int = 4,
        dim_feedforward: int = 1024,
        dropout: float = 0.1,
        max_seq_len: int = 168  # 7 days * 24 hours
    ):
        super().__init__()
        
        self.input_dim = input_dim
        self.d_model = d_model
        
        # Input embedding
        self.input_embedding = nn.Linear(input_dim, d_model)
        
        # Positional encoding
        self.pos_encoder = PositionalEncoding(d_model, max_seq_len)
        
        # Transformer encoder
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=dim_feedforward,
            dropout=dropout,
            batch_first=True
        )
        self.transformer_encoder = nn.TransformerEncoder(
            encoder_layer,
            num_layers=num_layers
        )
        
        # Output layers
        self.fc_out = nn.Sequential(
            nn.Linear(d_model, 128),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 3)  # [failure_prob, confidence, eta_hours]
        )
        
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Forward pass
        
        Args:
            x: Input tensor [batch, seq_len, input_dim]
            mask: Optional attention mask
            
        Returns:
            failure_prob: Probability of failure [batch, 1]
            confidence: Prediction confidence [batch, 1]
            eta: Estimated hours to failure [batch, 1]
        """
        # Embed input
        x = self.input_embedding(x)  # [batch, seq_len, d_model]
        
        # Add positional encoding
        x = x.transpose(0, 1)  # [seq_len, batch, d_model]
        x = self.pos_encoder(x)
        x = x.transpose(0, 1)  # [batch, seq_len, d_model]
        
        # Transformer encoding
        encoded = self.transformer_encoder(x, src_key_padding_mask=mask)  # [batch, seq_len, d_model]
        
        # Take the last output
        last_output = encoded[:, -1, :]  # [batch, d_model]
        
        # Generate predictions
        output = self.fc_out(last_output)  # [batch, 3]
        
        failure_prob = self.sigmoid(output[:, 0:1])  # [batch, 1]
        confidence = self.sigmoid(output[:, 1:2])     # [batch, 1]
        eta = torch.relu(output[:, 2:3])              # [batch, 1] (hours, non-negative)
        
        return failure_prob, confidence, eta


class ChronosEnsemble(nn.Module):
    """
    Ensemble of LSTM + Transformer for robust predictions
    """
    
    def __init__(
        self,
        input_dim: int = 64,
        lstm_hidden: int = 128,
        transformer_dim: int = 256
    ):
        super().__init__()
        
        # LSTM branch
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=lstm_hidden,
            num_layers=2,
            batch_first=True,
            dropout=0.1
        )
        
        # Transformer branch
        self.transformer = ChronosTransformer(
            input_dim=input_dim,
            d_model=transformer_dim
        )
        
        # Fusion layer
        self.fusion = nn.Sequential(
            nn.Linear(lstm_hidden + 3, 64),
            nn.ReLU(),
            nn.Linear(64, 3)
        )
        
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Ensemble forward pass
        
        Args:
            x: Input tensor [batch, seq_len, input_dim]
            
        Returns:
            Combined predictions from LSTM + Transformer
        """
        # LSTM branch
        lstm_out, (h_n, c_n) = self.lstm(x)
        lstm_final = h_n[-1]  # [batch, lstm_hidden]
        
        # Transformer branch
        trans_prob, trans_conf, trans_eta = self.transformer(x)
        trans_out = torch.cat([trans_prob, trans_conf, trans_eta], dim=1)  # [batch, 3]
        
        # Fusion
        combined = torch.cat([lstm_final, trans_out], dim=1)  # [batch, lstm_hidden + 3]
        output = self.fusion(combined)  # [batch, 3]
        
        failure_prob = self.sigmoid(output[:, 0:1])
        confidence = self.sigmoid(output[:, 1:2])
        eta = torch.relu(output[:, 2:3])
        
        return failure_prob, confidence, eta


def create_model(model_type: str = "transformer", **kwargs) -> nn.Module:
    """
    Factory function to create models
    
    Args:
        model_type: "transformer", "lstm", or "ensemble"
        **kwargs: Model-specific parameters
        
    Returns:
        Model instance
    """
    if model_type == "transformer":
        return ChronosTransformer(**kwargs)
    elif model_type == "ensemble":
        return ChronosEnsemble(**kwargs)
    else:
        raise ValueError(f"Unknown model type: {model_type}")


# Example usage
if __name__ == "__main__":
    print("🔮 [CHRONOS] Testing Transformer Model...")
    
    # Create model
    model = ChronosTransformer(input_dim=64, d_model=256)
    print(f"   Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    # Test forward pass
    batch_size = 32
    seq_len = 168  # 7 days
    input_dim = 64
    
    x = torch.randn(batch_size, seq_len, input_dim)
    
    failure_prob, confidence, eta = model(x)
    
    print(f"   Input shape: {x.shape}")
    print(f"   Output shapes: {failure_prob.shape}, {confidence.shape}, {eta.shape}")
    print(f"   Sample prediction: prob={failure_prob[0].item():.3f}, conf={confidence[0].item():.3f}, eta={eta[0].item():.1f}h")
    print("\n✅ [CHRONOS] Model test complete!")
