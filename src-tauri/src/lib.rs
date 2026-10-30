#[tauri::command]
fn guardar_archivo(ruta: String, datos: Vec<u8>) -> Result<(), String> {
    std::fs::write(&ruta, datos).map_err(|e| e.to_string())
}

#[tauri::command]
fn leer_archivo(ruta: String) -> Result<Vec<u8>, String> {
    std::fs::read(&ruta).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![guardar_archivo, leer_archivo])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
