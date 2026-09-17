package com.futureforbes.plantme

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
override fun onCreate(savedInstanceState: Bundle?) {
super.onCreate(savedInstanceState)
setContent {
PlantMeTheme {
Surface(
modifier = Modifier.fillMaxSize(),
color = Color(0xFF040D09)
) {
PlantMeLiveTrackerScreen()
}
}
}
}
}

@Composable
fun PlantMeTheme(content: @Composable () -> Unit) {
MaterialTheme(
colorScheme = darkColorScheme(
primary = Color(0xFF10B981),
secondary = Color(0xFF34D399),
background = Color(0xFF040D09),
surface = Color(0xFF091711)
),
content = content
)
}

@Composable
fun PlantMeLiveTrackerScreen() {
Column(
modifier = Modifier
.fillMaxSize()
.padding(20.dp),
verticalArrangement = Arrangement.spacedBy(20.dp)
) {
// App Header
Row(
modifier = Modifier.fillMaxWidth(),
horizontalArrangement = Arrangement.SpaceBetween,
verticalAlignment = Alignment.CenterVertically
) {
Text(
text = "PLANTME Express",
fontSize = 24.sp,
fontWeight = FontWeight.Bold,
color = Color.White
)
Surface(
color = Color(0xFF10B981).copy(alpha = 0.2f),
shape = RoundedCornerShape(12.dp)
) {
Text(
text = "Live Order Tracking",
fontSize = 12.sp,
fontWeight = FontWeight.Bold,
color = Color(0xFF34D399),
modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
)
}
}

// Live Tracking Card
Card(
modifier = Modifier.fillMaxWidth(),
colors = CardDefaults.cardColors(containerColor = Color(0xFF091711)),
shape = RoundedCornerShape(20.dp)
) {
Column(
modifier = Modifier.padding(20.dp),
verticalArrangement = Arrangement.spacedBy(14.dp)
) {
Text(
text = "Order #ORD-9824",
fontSize = 18.sp,
fontWeight = FontWeight.Bold,
color = Color.White
)

Text(
text = "Status: Out for Delivery ",
fontSize = 14.sp,
fontWeight = FontWeight.Bold,
color = Color(0xFF34D399)
)

Divider(color = Color.White.copy(alpha = 0.1f))

// Progress Stepper Items
TrackingStepItem(title = "Order Placed", subtitle = "02:15 PM", isCompleted = true)
TrackingStepItem(title = "Accepted by Partner", subtitle = "02:20 PM", isCompleted = true)
TrackingStepItem(title = "Picked Up from Nursery", subtitle = "02:35 PM", isCompleted = true)
TrackingStepItem(title = "Out for Delivery", subtitle = "02:45 PM", isCompleted = true)
TrackingStepItem(title = "Delivered", subtitle = "Expected 03:00 PM", isCompleted = false)
}
}

// Rider Profile Card
Card(
modifier = Modifier.fillMaxWidth(),
colors = CardDefaults.cardColors(containerColor = Color(0xFF091711)),
shape = RoundedCornerShape(20.dp)
) {
Row(
modifier = Modifier.padding(16.dp),
verticalAlignment = Alignment.CenterVertically,
horizontalArrangement = Arrangement.spacedBy(16.dp)
) {
Surface(
color = Color(0xFF10B981),
shape = RoundedCornerShape(50.dp),
modifier = Modifier.size(48.dp)
) {
Box(contentAlignment = Alignment.Center) {
Text(text = "", fontSize = 20.sp)
}
}

Column(modifier = Modifier.weight(1f)) {
Text(
text = "Ramu Prasad",
fontSize = 16.sp,
fontWeight = FontWeight.Bold,
color = Color.White
)
Text(
text = "Hero Electric Scooter (KA-05-EQ-8821)",
fontSize = 12.sp,
color = Color.Gray
)
}

Button(
onClick = { /* Call Driver */ },
colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
) {
Text(text = "Call", color = Color.White)
}
}
}

Spacer(modifier = Modifier.weight(1f))

// Powered by Future Forbes
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

@Composable
fun TrackingStepItem(title: String, subtitle: String, isCompleted: Boolean) {
Row(
verticalAlignment = Alignment.CenterVertically,
horizontalArrangement = Arrangement.spacedBy(12.dp)
) {
Surface(
color = if (isCompleted) Color(0xFF34D399) else Color.Gray,
shape = RoundedCornerShape(50.dp),
modifier = Modifier.size(10.dp)
) {}

Column {
Text(
text = title,
fontSize = 13.sp,
fontWeight = if (isCompleted) FontWeight.Bold else FontWeight.Normal,
color = if (isCompleted) Color.White else Color.Gray
)
Text(
text = subtitle,
fontSize = 11.sp,
color = Color.Gray
)
}
}
}
