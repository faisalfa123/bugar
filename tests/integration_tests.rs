#[cfg(test)]
mod tests {
    use bugar::mastermind::{MastermindSolver, MASTER_FOODS, MASTER_WORKOUTS};
    use bugar::models::MastermindRequest;

    #[test]
    fn test_mastermind_solver_calorie_constraint() {
        let req = MastermindRequest {
            remaining_calories: 450.0,
            remaining_protein_g: 35.0,
            time_available_minutes: 15,
            preferred_location: "home".to_string(),
            meal_type: Some("lunch_dinner".to_string()),
        };

        let rec = MastermindSolver::solve(&req);
        assert!(!rec.recommended_foods.is_empty(), "Rekomendasi makanan tidak boleh kosong");
        assert!(rec.total_calories <= 450.0 * 1.2, "Kalori tidak boleh melebihi toleransi budget");
        assert!(rec.total_protein_g > 10.0, "Protein harus memenuhi nilai minimum");
        assert!(rec.recommended_fat_burner.is_some(), "Harus ada rekomendasi fat burner");
    }

    #[test]
    fn test_mastermind_catalog_integrity() {
        assert!(MASTER_FOODS.len() >= 10, "Katalog makanan harus minimal 10 item");
        assert!(MASTER_WORKOUTS.len() >= 5, "Katalog workout harus minimal 5 item");
    }
}
