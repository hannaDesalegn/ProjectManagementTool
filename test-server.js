// Quick test script to verify server functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testServer() {
    try {
        console.log('🧪 Testing server functionality...\n');
        
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthRes = await fetch(`${BASE_URL}/health`);
        const health = await healthRes.json();
        console.log('✅ Health check:', health.status);
        
        // Test registration
        console.log('\n2. Testing user registration...');
        const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'Test123!',
                termsAccepted: true
            })
        });
        
        if (registerRes.ok) {
            console.log('✅ Registration successful');
        } else {
            const error = await registerRes.json();
            console.log('ℹ️ Registration response:', error.message || 'User might already exist');
        }
        
        // Test login
        console.log('\n3. Testing user login...');
        const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'Test123!'
            })
        });
        
        if (loginRes.ok) {
            const loginData = await loginRes.json();
            console.log('✅ Login successful');
            
            const token = loginData.token;
            
            // Test protected endpoint
            console.log('\n4. Testing protected endpoint...');
            const protectedRes = await fetch(`${BASE_URL}/api/protected`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (protectedRes.ok) {
                console.log('✅ Protected endpoint accessible');
            } else {
                console.log('❌ Protected endpoint failed');
            }
            
            // Test workspace creation
            console.log('\n5. Testing workspace creation...');
            const workspaceRes = await fetch(`${BASE_URL}/api/workspaces`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    name: 'Test Workspace',
                    type: 'PERSONAL'
                })
            });
            
            if (workspaceRes.ok) {
                const workspace = await workspaceRes.json();
                console.log('✅ Workspace created:', workspace.workspace?.name);
                
                // Test project creation
                console.log('\n6. Testing project creation...');
                const projectRes = await fetch(`${BASE_URL}/api/projects`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        name: 'Test Project',
                        description: 'A test project',
                        workspace_id: workspace.workspace.id,
                        start_date: '2026-03-01',
                        end_date: '2026-04-01'
                    })
                });
                
                if (projectRes.ok) {
                    const project = await projectRes.json();
                    console.log('✅ Project created:', project.project?.name);
                } else {
                    const error = await projectRes.json();
                    console.log('❌ Project creation failed:', error.error);
                }
            } else {
                const error = await workspaceRes.json();
                console.log('❌ Workspace creation failed:', error.error);
            }
            
        } else {
            const error = await loginRes.json();
            console.log('❌ Login failed:', error.message);
        }
        
        console.log('\n🎉 Server test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testServer();