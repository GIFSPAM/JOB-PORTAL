import pool from '../config/db.js';

export const updateResume = async (req, res) => {
    try {
        // 1. Check if Multer successfully processed a file
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "No file uploaded. Please select a PDF." 
            });
        }

        const seeker_id = req.user.user_id;
        
        // 2. Define the path where the file is stored on the server
        const resume_path = `/uploads/${req.file.filename}`; 
        
        // 3. Capture the original name of the file (e.g., "my_cv.pdf")
        const original_name = req.file.originalname;

        // 4. Update both columns in the database
        // Order of variables in the array must match the '?' order in the string
        const query = `
            UPDATE JobSeekers 
            SET resume_path = ?, resume_filename = ? 
            WHERE seeker_id = ?
        `;
        
        await pool.query(query, [resume_path, original_name, seeker_id]);

        res.status(200).json({ 
            success: true, 
            message: "Resume uploaded and profile updated successfully!",
            data: {
                path: resume_path,
                filename: original_name
            }
        });
    } catch (err) {
        // Log the error for the developer and send a clear message to the user
        console.error("Upload Error:", err);
        res.status(500).json({ success: false, error: "Internal server error during upload." });
    }
};