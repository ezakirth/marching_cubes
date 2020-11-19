precision mediump float;

varying vec4 v_position;
varying vec3 v_normal;

uniform vec3 u_lightPos;
uniform vec4 u_ambient;
uniform vec4 u_diffuse;
uniform vec4 u_specular;
uniform float u_shininess;

void main() {
    vec3 N = normalize(v_normal);
    vec3 L = normalize(u_lightPos - v_position.xyz);

    // Lambert's cosine law
    float lambertian = max(dot(N, L), 0.0);
    float specular = 0.0;
    if(lambertian > 0.0) {
        vec3 R = reflect(-L, N);      // Reflected light vector
        vec3 V = normalize(-v_position.xyz); // Vector to viewer
        // Compute the specular term
        float specAngle = max(dot(R, V), 0.0);
        specular = pow(specAngle, u_shininess);
    }
    gl_FragColor = u_ambient + lambertian * u_diffuse + specular * u_specular;

}