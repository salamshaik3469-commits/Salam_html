CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  tech TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO projects (title, description, tech)
SELECT 'AI Study Assistant', 'A student-focused assistant concept for answering questions and organizing study resources.', ARRAY['AI/ML','JavaScript','API']
WHERE NOT EXISTS (SELECT 1 FROM projects);
INSERT INTO projects (title, description, tech)
SELECT 'Weather Dashboard', 'A responsive dashboard that presents live weather information in a clear, mobile-friendly interface.', ARRAY['HTML','CSS','JavaScript']
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Weather Dashboard');
INSERT INTO projects (title, description, tech)
SELECT 'Data Structures Visualizer', 'Interactive visual explanations for stacks, queues, trees and graph traversals.', ARRAY['JavaScript','Algorithms','UI']
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Data Structures Visualizer');
