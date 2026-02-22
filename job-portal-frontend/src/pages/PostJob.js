import { useState } from "react";
import api from "../api/axios";

const PostJob = () => {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    eligibility: "",
    requirements: "",
    jobType: "Full-time",
  });

  const [customFields, setCustomFields] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addField = () => {
    setCustomFields([
      ...customFields,
      { label: "", type: "text", required: false },
    ]);
  };

  const updateField = (index, key, value) => {
    const updated = [...customFields];
    updated[index][key] = value;
    setCustomFields(updated);
  };

  const removeField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      await api.post("/jobs", {
        ...form,
        customFields,
      });

      setSuccess("Job posted successfully ✅");

      setForm({
        title: "",
        company: "",
        location: "",
        description: "",
        eligibility: "",
        requirements: "",
        jobType: "Full-time",
      });

      setCustomFields([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post job");
    }
  };

  return (
    <div className="container">
      <div className="form-wrap">
        <div className="form-box">
          <h2 className="page-title">Post a Job</h2>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <form onSubmit={handleSubmit}>

            <input className="input" name="title" placeholder="Job Title"
              value={form.title} onChange={handleChange} />

            <input className="input" name="company" placeholder="Company"
              value={form.company} onChange={handleChange} />

            <input className="input" name="location" placeholder="Location"
              value={form.location} onChange={handleChange} />

            <textarea className="textarea" name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange} />

            <textarea className="textarea" name="eligibility"
              placeholder="Eligibility"
              value={form.eligibility}
              onChange={handleChange} />

            <textarea className="textarea" name="requirements"
              placeholder="Requirements"
              value={form.requirements}
              onChange={handleChange} />

            <select className="select"
              name="jobType"
              value={form.jobType}
              onChange={handleChange}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>

            {/* CUSTOM QUESTIONS */}
            <h3 style={{ marginTop: 20 }}>Application Questions</h3>

            {customFields.map((field, index) => (
              <div key={index} className="card" style={{ marginTop: 10 }}>
                <input
                  className="input"
                  placeholder="Question"
                  value={field.label}
                  onChange={(e) =>
                    updateField(index, "label", e.target.value)
                  }
                />

                <select
                  className="select"
                  value={field.type}
                  onChange={(e) =>
                    updateField(index, "type", e.target.value)
                  }
                >
                  <option value="text">Short Text</option>
                  <option value="textarea">Long Text</option>
                  <option value="number">Number</option>
                  
                </select>

                <label>
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      updateField(index, "required", e.target.checked)
                    }
                  /> Required
                </label>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => removeField(index)}
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-outline"
              onClick={addField}
              style={{ marginTop: 10 }}
            >
              + Add Question
            </button>

            <button
              className="btn btn-primary"
              type="submit"
              style={{ marginTop: 20 }}
            >
              Post Job
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
