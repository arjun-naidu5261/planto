package com.futureforbes.plantme.delivery

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class DeliveryMainActivity : ComponentActivity() {
override fun onCreate(savedInstanceState: Bundle?) {
super.onCreate(savedInstanceState)
setContent {
MaterialTheme(
colorScheme = darkColorScheme(
primary = Color(0xFF10B981),
background = Color(0xFF040D09),
surface = Color(0xFF091711)
)
) {
Surface(
modifier = Modifier.fillMaxSize(),
color = Color(0xFF040D09)
) {
DeliveryPartnerScreen()
}
}
}
}
}

@Composable
fun DeliveryPartnerScreen() {
Column(
modifier = Modifier
.fillMaxSize()
.padding(20.dp),
verticalArrangement = Arrangement.spacedBy(20.dp)
) {
// Driver Header
Row(
modifier = Modifier.fillMaxWidth(),
horizontalArrangement = Arrangement.SpaceBetween,
verticalAlignment = Alignment.CenterVertically
) {
Column {
Text(
text = "Ramu Prasad",
fontSize = 22.sp,
fontWeight = FontWeight.Bold,
color = Color.White
)
Text(
text = "PLANTME Express Fleet Driver",
fontSize = 12.sp,
color = Color(0xFF34D399)
)
}

Column(horizontalAlignment = Alignment.End) {
Text(text = "TODAY'S EARNINGS", fontSize = 10.sp, color = Color.Gray)
Text(
text = "₹4,250",
fontSize = 18.sp,
fontWeight = FontWeight.Bold,
color = Color(0xFF34D399)
)
}
}

// Active Delivery Card
Card(
modifier = Modifier.fillMaxWidth(),
colors = CardDefaults.cardColors(containerColor = Color(0xFF091711)),
shape = RoundedCornerShape(20.dp)
) {
Column(
modifier = Modifier.padding(20.dp),
verticalArrangement = Arrangement.spacedBy(12.dp)
) {
Row(
modifier = Modifier.fillMaxWidth(),
horizontalArrangement = Arrangement.SpaceBetween
) {
Text(text = "ACTIVE TRIP: ORD-9824", fontWeight = FontWeight.Bold, color = Color.White)
Text(text = "₹120 Payout", fontWeight = FontWeight.Bold, color = Color(0xFF34D399))
}

Text(
text = "Pickup: Sai Baba Plant Stall (Indiranagar)
Drop: Aarav Sharma (Koramangala)",
fontSize = 12.sp,
color = Color.Gray
)

Button(
onClick = { /* Update Delivery Status */ },
modifier = Modifier.fillMaxWidth(),
colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
) {
Text(text = " Advance Trip Status (Mark Delivered)", color = Color.White)
}
}
}

// Available Jobs
Text(
text = "Available Jobs Near You",
fontSize = 18.sp,
fontWeight = FontWeight.Bold,
color = Color.White
)

Card(
modifier = Modifier.fillMaxWidth(),
colors = CardDefaults.cardColors(containerColor = Color(0xFF091711)),
shape = RoundedCornerShape(20.dp)
) {
Column(
modifier = Modifier.padding(16.dp),
verticalArrangement = Arrangement.spacedBy(10.dp)
) {
Row(
modifier = Modifier.fillMaxWidth(),
horizontalArrangement = Arrangement.SpaceBetween
) {
Text(text = "ORD-9825 • HSR Layout", fontWeight = FontWeight.Bold, color = Color.White)
Text(text = "₹95 Payout", fontWeight = FontWeight.Bold, color = Color(0xFF34D399))
}

Text(
text = "Pickup: Green Terra Organic Nursery (1.8 km)",
fontSize = 12.sp,
color = Color.Gray
)

Button(
onClick = { /* Accept Order */ },
modifier = Modifier.fillMaxWidth(),
colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981).copy(alpha = 0.8f))
) {
Text(text = " Accept & Start Pickup", color = Color.White)
}
}
}

Spacer(modifier = Modifier.weight(1f))

Row(
modifier = Modifier.fillMaxWidth(),
horizontalArrangement = Arrangement.Center
) {
Text(
text = "Powered by Future Forbes Pvt. Ltd.",
fontSize = 12.sp,
fontWeight = FontWeight.Bold,
color = Color(0xFF34D399)
)
}
}
}
