use wasm_bindgen::prelude::*;
use serde::Serialize;
use std::collections::HashMap;

// ─── Structs ────────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct LogAnalysis {
    top_ips: Vec<(String, u32)>,
    error_codes: HashMap<String, u32>,
    bruteforce: Vec<String>,
    total_lines: u32,
}

#[derive(Serialize)]
struct IocResult {
    ips: Vec<String>,
    domains: Vec<String>,
    hashes: HashMap<String, Vec<String>>,
    cves: Vec<String>,
    emails: Vec<String>,
}

// ─── Public WASM API ─────────────────────────────────────────────────────────

/// Parse Apache/Nginx/SSH logs and return a JSON summary.
#[wasm_bindgen]
pub fn analyze_logs(input: &str) -> String {
    let mut ip_counts: HashMap<String, u32> = HashMap::new();
    let mut error_codes: HashMap<String, u32> = HashMap::new();
    let mut ssh_fails: HashMap<String, u32> = HashMap::new();
    let mut http_401s: HashMap<String, u32> = HashMap::new();
    let mut total_lines: u32 = 0;

    for line in input.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        total_lines += 1;

        if line.contains("Failed password") {
            // SSH: "Failed password for [invalid user] USER from IP port N"
            if let Some(ip) = extract_ssh_ip(line) {
                *ip_counts.entry(ip.clone()).or_insert(0) += 1;
                *ssh_fails.entry(ip).or_insert(0) += 1;
            }
        } else if let Some((ip, status)) = parse_apache_line(line) {
            *ip_counts.entry(ip.clone()).or_insert(0) += 1;
            *error_codes.entry(status.to_string()).or_insert(0) += 1;
            if status == 401 {
                *http_401s.entry(ip).or_insert(0) += 1;
            }
        }
    }

    // IPs with > 10 SSH failures or > 10 HTTP 401s
    let mut bruteforce: Vec<String> = ssh_fails
        .iter()
        .filter(|(_, &c)| c > 10)
        .map(|(ip, _)| ip.clone())
        .chain(
            http_401s
                .iter()
                .filter(|(_, &c)| c > 10)
                .map(|(ip, _)| ip.clone()),
        )
        .collect();
    bruteforce.sort();
    bruteforce.dedup();

    // Top IPs sorted by frequency descending
    let mut top_ips: Vec<(String, u32)> = ip_counts.into_iter().collect();
    top_ips.sort_by(|a, b| b.1.cmp(&a.1));

    let result = LogAnalysis {
        top_ips,
        error_codes,
        bruteforce,
        total_lines,
    };
    serde_json::to_string(&result).unwrap_or_else(|_| "{}".to_string())
}

/// Extract IOCs (IPs, domains, hashes, CVEs, emails) from raw text.
#[wasm_bindgen]
pub fn extract_iocs(input: &str) -> String {
    let mut ips: Vec<String> = Vec::new();
    let mut domains: Vec<String> = Vec::new();
    let mut hashes: HashMap<String, Vec<String>> = HashMap::new();
    let mut cves: Vec<String> = Vec::new();
    let mut emails: Vec<String> = Vec::new();

    collect_ips(input, &mut ips);
    collect_cves(input, &mut cves);
    collect_emails(input, &mut emails);
    collect_hashes(input, &mut hashes);
    collect_domains(input, &ips, &mut domains);

    // Deduplicate and sort all collections
    ips.sort();
    ips.dedup();
    domains.sort();
    domains.dedup();
    cves.sort();
    cves.dedup();
    emails.sort();
    emails.dedup();
    for v in hashes.values_mut() {
        v.sort();
        v.dedup();
    }

    let result = IocResult { ips, domains, hashes, cves, emails };
    serde_json::to_string(&result).unwrap_or_else(|_| "{}".to_string())
}

// ─── Log parsing helpers ─────────────────────────────────────────────────────

fn is_valid_ipv4(s: &str) -> bool {
    let parts: Vec<&str> = s.split('.').collect();
    if parts.len() != 4 {
        return false;
    }
    parts.iter().all(|p| !p.is_empty() && p.parse::<u8>().is_ok())
}

/// Extract the source IP from an SSH "Failed password" log line.
fn extract_ssh_ip(line: &str) -> Option<String> {
    let after = line.find(" from ")? ;
    let rest = &line[after + 6..];
    let ip = rest.split_whitespace().next()?.to_string();
    if is_valid_ipv4(&ip) { Some(ip) } else { None }
}

/// Parse an Apache/Nginx combined-log line → (ip, status_code).
/// Format: IP - - [date time] "METHOD URI PROTO" STATUS bytes ...
fn parse_apache_line(line: &str) -> Option<(String, u16)> {
    let ip = line.split_whitespace().next()?.to_string();
    if !is_valid_ipv4(&ip) {
        return None;
    }
    // The HTTP request is in the first quoted string; the status follows.
    let first_q = line.find('"')?;
    let second_q = line[first_q + 1..].find('"')? + first_q + 1;
    let after = line[second_q + 1..].trim_start();
    let status_str = after.split_whitespace().next()?;
    let status: u16 = status_str.parse().ok()?;
    Some((ip, status))
}

// ─── IOC extraction helpers ──────────────────────────────────────────────────

/// Walk the text byte-by-byte and collect valid IPv4 addresses.
fn collect_ips(input: &str, ips: &mut Vec<String>) {
    let bytes = input.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    while i < len {
        if bytes[i].is_ascii_digit() {
            let start = i;
            while i < len && (bytes[i].is_ascii_digit() || bytes[i] == b'.') {
                i += 1;
            }
            let candidate = &input[start..i];
            if is_valid_ipv4(candidate) {
                let before_ok = start == 0 || !input.as_bytes()[start - 1].is_ascii_alphanumeric();
                let after_ok = i >= len || !bytes[i].is_ascii_alphanumeric();
                if before_ok && after_ok {
                    ips.push(candidate.to_string());
                }
            }
        } else {
            i += 1;
        }
    }
}

/// Collect CVE identifiers (CVE-YYYY-NNNNN+).
fn collect_cves(input: &str, cves: &mut Vec<String>) {
    let mut pos = 0;
    while let Some(rel) = input[pos..].find("CVE-") {
        let start = pos + rel;
        let rest = &input[start + 4..];
        // year: exactly 4 digits
        let year: String = rest.chars().take_while(|c| c.is_ascii_digit()).collect();
        if year.len() == 4 {
            let after_year = &rest[4..];
            if after_year.starts_with('-') {
                let num: String = after_year[1..].chars().take_while(|c| c.is_ascii_digit()).collect();
                if num.len() >= 4 {
                    let end = start + 4 + 4 + 1 + num.len(); // "CVE-" + year + "-" + num
                    cves.push(input[start..end].to_string());
                }
            }
        }
        pos = start + 4;
    }
}

/// Collect email addresses (simple heuristic: local@domain.tld).
fn collect_emails(input: &str, emails: &mut Vec<String>) {
    for raw_word in input.split_whitespace() {
        // Strip surrounding punctuation that isn't part of an email
        let word = raw_word.trim_matches(|c: char| {
            matches!(c, ',' | ';' | ':' | '<' | '>' | '(' | ')' | '[' | ']' | '"' | '\'')
        });
        if let Some(at) = word.find('@') {
            let local = &word[..at];
            let domain = &word[at + 1..];
            if local.is_empty() || domain.is_empty() {
                continue;
            }
            let local_ok = local
                .chars()
                .all(|c| c.is_alphanumeric() || matches!(c, '.' | '_' | '-' | '+'));
            let domain_ok = domain.contains('.')
                && domain
                    .chars()
                    .all(|c| c.is_alphanumeric() || matches!(c, '.' | '-'));
            if local_ok && domain_ok {
                emails.push(word.to_lowercase());
            }
        }
    }
}

/// Collect hex hashes by length: MD5 (32), SHA1 (40), SHA256 (64).
fn collect_hashes(input: &str, hashes: &mut HashMap<String, Vec<String>>) {
    // Split on any non-hex character to get hex-only tokens
    for token in input.split(|c: char| !c.is_ascii_hexdigit()) {
        if token.chars().all(|c| c.is_ascii_hexdigit()) {
            let key = match token.len() {
                32 => "md5",
                40 => "sha1",
                64 => "sha256",
                _ => continue,
            };
            hashes
                .entry(key.to_string())
                .or_default()
                .push(token.to_lowercase());
        }
    }
}

/// Collect domain names, excluding already-known IPs.
fn collect_domains(input: &str, known_ips: &[String], domains: &mut Vec<String>) {
    const KNOWN_TLDS: &[&str] = &[
        "com", "net", "org", "io", "gov", "edu", "mil", "int",
        "co", "uk", "de", "fr", "ru", "cn", "jp", "br", "au",
        "info", "biz", "xyz", "me", "dev", "app", "onion",
    ];

    for raw_word in input.split_whitespace() {
        let word = raw_word.trim_matches(|c: char| {
            matches!(c, ',' | ';' | ':' | '<' | '>' | '(' | ')' | '[' | ']' | '"' | '\'')
        });
        // Must contain a dot, must not already be a known IP
        if !word.contains('.') || known_ips.contains(&word.to_string()) {
            continue;
        }
        let parts: Vec<&str> = word.split('.').collect();
        if parts.len() < 2 {
            continue;
        }
        let tld = parts.last().unwrap().to_lowercase();
        if !KNOWN_TLDS.contains(&tld.as_str()) {
            continue;
        }
        // Every label must be non-empty alphanumeric-or-hyphen, and must not
        // parse as a pure number (which would suggest it's part of an IP).
        let valid = parts.iter().all(|p| {
            !p.is_empty()
                && p.chars().all(|c| c.is_alphanumeric() || c == '-')
                && p.parse::<u64>().is_err() // exclude raw-number labels
        });
        if valid {
            domains.push(word.to_lowercase());
        }
    }
}
