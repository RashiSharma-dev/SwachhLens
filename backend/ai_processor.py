import random

def classify_waste(image_file) -> list[str]:
    """Mock Waste Classification: randomly assigns tags."""
    tags = [
        "overflowing bin", "garbage dump", "plastic waste", 
        "construction debris", "organic waste", "e-waste", 
        "hazardous waste", "drain blockage"
    ]
    # randomly pick 1 to 3 tags
    return random.sample(tags, k=random.randint(1, 3))

def estimate_volume(image_file) -> str:
    """Mock Volume Estimation: simulates depth estimation."""
    volumes = ["Small", "Medium", "Large", "Very Large"]
    return random.choice(volumes)

def determine_intervention(volume: str, tags: list[str], report_frequency: int, age_hours: int) -> tuple[int, str]:
    """
    ponytail: basic rule engine for severity and intervention.
    Returns (severity_score, intervention_action).
    """
    is_sensitive = random.choice([True, False]) # mock flag for nearby schools/hospitals
    
    score = 10
    if volume in ["Large", "Very Large"]: score += 40
    if is_sensitive: score += 25
    score += min(report_frequency * 5, 25)
    score += min(age_hours, 24)
    severity_score = min(max(score, 1), 100)
    
    has_hazardous = any(t in ["hazardous waste", "bio-waste"] for t in tags)
    has_recyclable = any(t in ["e-waste", "plastic waste", "plastic", "cardboard"] for t in tags)
    
    if has_hazardous or is_sensitive:
        intervention = "Escalate immediately"
    elif has_recyclable:
        intervention = "Broadcast to Swachh-Preneurs"
    elif volume in ["Large", "Very Large"]:
        intervention = "Dispatch extra workers and mini truck"
    elif volume == "Small":
        intervention = "Assign manual cleanup team"
    else:
        intervention = "Schedule standard cleanup"
        
    return severity_score, intervention

def verify_cleanup(before_img, after_img) -> dict:
    """
    ponytail: mock AI cleanup verification.
    """
    # Simulate comparing images, randomly decide if volume is 0
    after_volume_zero = random.choice([True, False])
    return {
        "status": "Resolved" if after_volume_zero else "Pending",
        "message": "Cleanup verified successfully" if after_volume_zero else "Waste still detected. Please clean thoroughly."
    }
