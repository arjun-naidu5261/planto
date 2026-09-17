package com.futureforbes.plantme.vendor

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

class VendorMainActivity : ComponentActivity() {
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
VendorDashboardScreen()
}
}
}
}
}

@Composable
fun VendorDashboardScreen() {
var isOpen by remember { mutableStateOf(true) }

Column(
modifier = Modifier
.fillMaxSize()
.padding(20.dp),
verticalArrangement = Arrangement.spacedBy(20.dp)
) {
// Header
Row(
modifier = Modifier.fillMaxWidth(),
horizontalArrangement = Arrangement.SpaceBetween,
verticalAlignment = Alignment.CenterVertically
) {
Column {
Text(
text = "Sai Baba Plant Stall",
fontSize = 22.sp,
fontWeight = FontWeight.Bold,
color = Color.White
)
Text(
text = "Nursery Vendor Console",
fontSize = 12.sp,
color = Color(0xFF34D399)
)
}

Switch(
checked = isOpen,
onCheckedChange = { isOpen = it }
)
}

// Monthly Earnings Card
Card(
modifier = Modifier.fillMaxWidth(),
colors = CardDefaults.cardColors(containerColor = Color(0xFF091711)),
shape = RoundedCornerShape(20.dp)
) {
Column(
modifier = Modifier.padding(20.dp),
verticalArrangement = Arrangement.spacedBy(10.dp)
) {
Text(text = "TOTAL SALES (THIS MONTH)", fontSize = 11.sp, color = Color.Gray)
Text(
text = "₹48,200",
fontSize = 32.sp,
fontWeight = FontWeight.Bold,
color = Color(0xFF34D399)
)
Button(
onClick = { /* Request Payout */ },
colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
) {
Text(text = " Request Payout", color = Color.White)
}
}
}

// Live Incoming Orders
Text(
text = "Live Incoming Orders",
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
Text(text = "ORD-9824", fontWeight = FontWeight.Bold, color = Color.White)
Text(text = "₹420", fontWeight = FontWeight.Bold, color = Color(0xFF34D399))
}

Text(
text = "1x Premium Golden Pothos • 2x Neem Cake Fertilizer",
fontSize = 12.sp,
color = Color.Gray
)

Row(
modifier = Modifier.fillMaxWidth(),
horizontalArrangement = Arrangement.SpaceBetween,
verticalAlignment = Alignment.CenterVertically
) {
Text(text = "Assigned: Ramu Prasad ", fontSize = 12.sp, color = Color(0xFF38BDF8))
Button(
onClick = { /* Pack Order */ },
colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
) {
Text(text = "Mark Packed", fontSize = 12.sp, color = Color.White)
}
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
